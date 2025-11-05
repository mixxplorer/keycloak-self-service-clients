package de.mixxplorer.keycloak.ssc.rest;

import java.util.List;

import org.keycloak.OAuthErrorException;
import org.keycloak.events.Errors;
import org.keycloak.events.admin.OperationType;
import org.keycloak.models.ClientModel;
import org.keycloak.models.ClientSecretConstants;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.ModelDuplicateException;
import org.keycloak.models.RealmModel;
import org.keycloak.models.utils.KeycloakModelUtils;
import org.keycloak.models.utils.ModelToRepresentation;
import org.keycloak.models.utils.RepresentationToModel;
import org.keycloak.protocol.oidc.OIDCClientSecretConfigWrapper;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.services.ErrorResponse;
import org.keycloak.services.ErrorResponseException;
import org.keycloak.services.clientpolicy.ClientPolicyException;
import org.keycloak.services.clientpolicy.context.AdminClientUnregisterContext;
import org.keycloak.services.clientpolicy.context.AdminClientUpdateContext;
import org.keycloak.services.clientpolicy.context.AdminClientUpdatedContext;
import org.keycloak.services.clientpolicy.context.ClientSecretRotationContext;
import org.keycloak.services.managers.AuthenticationManager;
import org.keycloak.services.managers.ClientManager;
import org.keycloak.services.managers.RealmManager;
import org.keycloak.services.resources.admin.AdminEventBuilder;
import org.keycloak.services.resources.admin.AdminRoot;
import org.keycloak.services.resources.admin.fgap.AdminPermissionEvaluator;
import org.keycloak.validation.ValidationUtil;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import de.mixxplorer.keycloak.ssc.rest.dto.SelfServiceClientRepresentation;
import de.mixxplorer.keycloak.ssc.rest.dto.SelfServiceClientWritableRepresentation;

import static de.mixxplorer.keycloak.ssc.Util.setManagersByUsername;
import static de.mixxplorer.keycloak.ssc.Util.getManagerNames;

public class SelfServiceClientResources {
    private final KeycloakSession session;
    private final RealmModel realm;
    private final AdminPermissionEvaluator adminAuth;
    private final AuthenticationManager.AuthResult auth;
    private final AdminEventBuilder adminEvent;
    private final ClientModel clientModel;

    public SelfServiceClientResources(KeycloakSession keycloakSession, RealmModel realm,
                                      AuthenticationManager.AuthResult auth, AdminPermissionEvaluator adminAuth,
                                      AdminEventBuilder adminEvent, ClientModel clientModel) {
        this.session = keycloakSession;
        this.realm = realm;
        this.auth = auth;
        this.adminAuth = adminAuth;
        this.adminEvent = adminEvent;
        this.clientModel = clientModel;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public SelfServiceClientRepresentation get() {
        ClientRepresentation representation = ModelToRepresentation.toRepresentation(clientModel, session);
        List<String> managers = getManagerNames(clientModel, this.session).toList();

        return new SelfServiceClientRepresentation(representation, managers);
    }

    // based on org.keycloak.services.resources.admin (org/keycloak/services/resources/admin/ClientsResource.java)
    @DELETE
    public void delete() {
        try {
            session.clientPolicy().triggerOnEvent(new AdminClientUnregisterContext(clientModel, adminAuth.adminAuth()));
        } catch (ClientPolicyException cpe) {
            throw new ErrorResponseException(cpe.getError(), cpe.getErrorDetail(), Response.Status.BAD_REQUEST);
        }

        if (new ClientManager(new RealmManager(session)).removeClient(realm, clientModel)) {
            adminEvent.operation(OperationType.DELETE).resourcePath(session.getContext().getUri()).success();
        } else {
            throw new ErrorResponseException(OAuthErrorException.INVALID_REQUEST, "Could not delete client",
                    Response.Status.BAD_REQUEST);
        }
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(final SelfServiceClientWritableRepresentation clientWritableRep) {
        try {
            ClientRepresentation rep = clientWritableRep.toClientRepresentation();

            session.setAttribute(ClientSecretConstants.CLIENT_SECRET_ROTATION_ENABLED, Boolean.FALSE);
            session.clientPolicy().triggerOnEvent(new AdminClientUpdateContext(rep, clientModel, adminAuth.adminAuth()));

            // users cannot enable or disable service accounts for a client

            if (rep.getClientId() != null && !rep.getClientId().equals(clientModel.getClientId())) {
                // users are not allowed to change the client ID.
                // Imaging the following case:
                // * user creates a client
                // * admin manually enables a specific functionality
                // * user renames the client
                // * user tricks the admin to enable another specific functionality for a now "new" client (from admin side)
                // * client might have way too many rights, causing confusion for the admins
                // Therefore: We do not allow changing client IDs
                throw new BadRequestException("Client ID must not change");
            }

            // We do not allow enabling authorization services for ssc clients, but an admin might have them enabled for
            // a ssc client. Therefore, if the preconditions for enabling such clients (like having a secret client) do
            // change we have to ensure that authorization services get disabled again.
            if ((rep.isBearerOnly() != null && rep.isBearerOnly()) || (rep.isPublicClient() != null && rep.isPublicClient())) {
                rep.setAuthorizationServicesEnabled(false);
            }

            RepresentationToModel.updateClient(rep, clientModel, session);

            setManagersByUsername(clientModel, clientWritableRep.managers, auth.getUser(), session);

            ValidationUtil.validateClient(session, clientModel, false, r -> {
                session.getTransactionManager().setRollbackOnly();
                throw new ErrorResponseException(
                        Errors.INVALID_INPUT,
                        r.getAllLocalizedErrorsAsString(AdminRoot.getMessages(session, realm,
                                adminAuth.adminAuth().getToken().getLocale())),
                        Response.Status.BAD_REQUEST);
            });

            session.clientPolicy().triggerOnEvent(new AdminClientUpdatedContext(rep, clientModel, adminAuth.adminAuth()));
            adminEvent.operation(OperationType.UPDATE).resourcePath(session.getContext().getUri()).representation(rep).success();

            return Response.noContent().build();
        } catch (ModelDuplicateException e) {
            throw ErrorResponse.exists("Client with specified (new) Client ID already exists");
        } catch (ClientPolicyException cpe) {
            throw new ErrorResponseException(cpe.getError(), cpe.getErrorDetail(), Response.Status.BAD_REQUEST);
        }
    }

    // based on org.keycloak.services.resources.admin.ClientResource (org/keycloak/services/resources/admin/ClientResource.java)
    @Path("secret/regenerate")
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public SelfServiceClientRepresentation regenerateSecret() {
        try {
            session.setAttribute(ClientSecretConstants.CLIENT_SECRET_ROTATION_ENABLED,Boolean.FALSE);

            ClientRepresentation representation = ModelToRepresentation.toRepresentation(clientModel, session);
            ClientSecretRotationContext secretRotationContext = new ClientSecretRotationContext(
                    representation, clientModel, clientModel.getSecret());

            String secret = KeycloakModelUtils.generateSecret(clientModel);

            session.clientPolicy().triggerOnEvent(secretRotationContext);

            CredentialRepresentation rep = new CredentialRepresentation();
            rep.setType(CredentialRepresentation.SECRET);
            rep.setValue(secret);

            if (!(boolean) session.getAttribute(ClientSecretConstants.CLIENT_SECRET_ROTATION_ENABLED)) {
                OIDCClientSecretConfigWrapper.fromClientModel(clientModel).removeClientSecretRotationInfo();
            }

            adminEvent.operation(OperationType.ACTION).resourcePath(session.getContext().getUri()).representation(rep).success();
            session.removeAttribute(ClientSecretConstants.CLIENT_SECRET_ROTATION_ENABLED);
        } catch (ClientPolicyException cpe) {
            throw new ErrorResponseException(cpe.getError(), cpe.getErrorDetail(),
                    Response.Status.BAD_REQUEST);
        }
        return get();
    }
}
