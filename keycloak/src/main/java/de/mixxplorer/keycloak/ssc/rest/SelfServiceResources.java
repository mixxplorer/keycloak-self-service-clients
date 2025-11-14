package de.mixxplorer.keycloak.ssc.rest;

import de.mixxplorer.keycloak.ssc.rest.dto.SelfServiceClientRepresentation;
import de.mixxplorer.keycloak.ssc.rest.dto.SelfServiceClientWritableRepresentation;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.keycloak.events.Errors;
import org.keycloak.events.admin.OperationType;
import org.keycloak.models.ClientModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.ModelDuplicateException;
import org.keycloak.models.RealmModel;
import org.keycloak.models.utils.ModelToRepresentation;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.services.ErrorResponse;
import org.keycloak.services.ErrorResponseException;
import org.keycloak.services.clientpolicy.ClientPolicyException;
import org.keycloak.services.clientpolicy.context.AdminClientRegisterContext;
import org.keycloak.services.clientpolicy.context.AdminClientRegisteredContext;
import org.keycloak.services.managers.AuthenticationManager;
import org.keycloak.services.managers.ClientManager;
import org.keycloak.services.resources.admin.AdminAuth;
import org.keycloak.services.resources.admin.AdminEventBuilder;
import org.keycloak.services.resources.admin.AdminRoot;
import org.keycloak.services.resources.admin.fgap.AdminPermissionEvaluator;
import org.keycloak.services.resources.admin.fgap.AdminPermissions;
import org.keycloak.validation.ValidationUtil;

import java.util.Map;
import java.util.stream.Stream;

import static de.mixxplorer.keycloak.ssc.Util.getManagerNames;
import static de.mixxplorer.keycloak.ssc.Util.getUserManageClientAttributeMap;
import static de.mixxplorer.keycloak.ssc.Util.hasUserAccessToClient;
import static de.mixxplorer.keycloak.ssc.Util.setManagersByUsername;

public class SelfServiceResources {
    private final KeycloakSession session;
    private final RealmModel realm;
    private final AdminPermissionEvaluator adminAuth;
    private final AuthenticationManager.AuthResult auth;
    private final AdminEventBuilder adminEvent;

    public SelfServiceResources(KeycloakSession keycloakSession, AuthenticationManager.AuthResult auth) {
        this.session = keycloakSession;
        this.realm = keycloakSession.getContext().getRealm();
        this.auth = auth;
        // we assume we have a valid authentication we can use to construct these objects
        this.adminAuth = AdminPermissions.evaluator(keycloakSession, realm, new AdminAuth(realm, auth.getToken(),
                auth.getUser(), auth.getClient()));
        this.adminEvent = new AdminEventBuilder(realm, this.adminAuth.adminAuth(), session, session.getContext().getConnection());
    }

    @GET
    @Path("clients")
    @Produces(MediaType.APPLICATION_JSON)
    public Stream<SelfServiceClientRepresentation> getClients() {
        final Map<String, String> clientAttributes = getUserManageClientAttributeMap(auth.getUser());

        Stream<ClientModel> clientModels = realm.searchClientByAttributes(clientAttributes, null, null);

        // we have to filter our results manually, see https://github.com/keycloak/keycloak/issues/25976
        // also even when using the internal SPI, it is not possible to overcome the global attribute filter
        clientModels = clientModels.filter(model -> hasUserAccessToClient(model, auth.getUser()));

        Stream<SelfServiceClientRepresentation> intermediateOutput = ModelToRepresentation.filterValidRepresentations(
            clientModels,
            client -> new SelfServiceClientRepresentation(
                ModelToRepresentation.toRepresentation(client, session),
                getManagerNames(client, this.session).toList()
            )
        );
        return intermediateOutput;
    }

    // based on org.keycloak.services.resources.admin (org/keycloak/services/resources/admin/ClientsResource.java)
    @POST
    @Path("clients")
    @Consumes(MediaType.APPLICATION_JSON)
    @APIResponse(responseCode = "200", description = "Created")
    public SelfServiceClientRepresentation create(final SelfServiceClientWritableRepresentation clientWritableRep) {
        ClientRepresentation rep = clientWritableRep.toClientRepresentation();

        try {
            session.clientPolicy().triggerOnEvent(new AdminClientRegisterContext(rep, adminAuth.adminAuth()));

            // persist new client
            ClientModel clientModel = ClientManager.createClient(session, realm, rep);

            setManagersByUsername(clientModel, clientWritableRep.managers, auth.getUser(), session);

            // we do not allow enabling service accounts

            adminEvent.operation(OperationType.CREATE).resourcePath(session.getContext().getUri(),
                    clientModel.getId()).representation(rep).success();

            // we do not allow enabling authorization services

            ValidationUtil.validateClient(session, clientModel, true, r -> {
                session.getTransactionManager().setRollbackOnly();
                throw new ErrorResponseException(
                        Errors.INVALID_INPUT,
                        r.getAllLocalizedErrorsAsString(AdminRoot.getMessages(session, realm,
                                adminAuth.adminAuth().getToken().getLocale())),
                        Response.Status.BAD_REQUEST);
            });

            // used for e.g. logging
            session.getContext().setClient(clientModel);
            session.clientPolicy().triggerOnEvent(new AdminClientRegisteredContext(clientModel, adminAuth.adminAuth()));


            return new SelfServiceClientRepresentation(
                ModelToRepresentation.toRepresentation(clientModel, session),
                getManagerNames(clientModel, session).toList()
            );
        } catch (ModelDuplicateException e) {
            throw ErrorResponse.exists("Client " + rep.getClientId() + " already exists");
        } catch (ClientPolicyException cpe) {
            throw new ErrorResponseException(cpe.getError(), cpe.getErrorDetail(), Response.Status.BAD_REQUEST);
        }
    }

    @Path("clients/{client-uuid}")
    public SelfServiceClientResources get(@PathParam("client-uuid") final String clientId) {
        ClientModel clientModel = realm.getClientById(clientId);
        if (clientModel == null) {
            throw new NotFoundException("Could not find client");
        }

        // check whether the user has access to the client
        if (!hasUserAccessToClient(clientModel, auth.getUser())) {
            throw new ForbiddenException("You do not have access to this client!");
        }

        session.getContext().setClient(clientModel);

        return new SelfServiceClientResources(session, realm, auth, adminAuth, adminEvent, clientModel);
    }
}
