package de.mixxplorer.keycloak.ssc.rest.dto;

import org.keycloak.representations.idm.ClientRepresentation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class SelfServiceClientRepresentation extends SelfServiceClientWritableRepresentation {
    public String id;

    public String secret;

    public Boolean standardFlowEnabled;
    public Boolean implicitFlowEnabled;
    public Boolean directAccessGrantsEnabled;
    public Boolean serviceAccountsEnabled;
    public Boolean authorizationServicesEnabled;

    public SelfServiceClientRepresentation(ClientRepresentation clientRepresentation, List<String> managers) {
        this.id = clientRepresentation.getId();

        this.clientId = clientRepresentation.getClientId();
        this.name = clientRepresentation.getName();
        this.description = clientRepresentation.getDescription();
        this.rootUrl = clientRepresentation.getRootUrl();
        this.baseUrl = clientRepresentation.getBaseUrl();
        this.enabled = clientRepresentation.isEnabled();
        this.redirectUris = clientRepresentation.getRedirectUris();

        this.webOrigins = clientRepresentation.getWebOrigins();

        this.publicClient = clientRepresentation.isPublicClient();
        this.frontchannelLogout = clientRepresentation.isFrontchannelLogout();

        Map<String, String> attrs = clientRepresentation.getAttributes();
        this.backchannelLogoutRevokeOfflineTokens = attrs.get("backchannel.logout.revoke.offline.tokens") != null
                && attrs.get("backchannel.logout.revoke.offline.tokens").equals("true");
        this.backchannelLogoutSessionRequired = attrs.get("backchannel.logout.session.required") != null
                && attrs.get("backchannel.logout.session.required").equals("true");
        this.backchannelLogoutUrl = attrs.get("backchannel.logout.url");
        if (this.backchannelLogoutUrl == null) {
            this.backchannelLogoutUrl = "";
        }
        this.frontchannelLogoutUrl = attrs.get("frontchannel.logout.url");
        if (this.frontchannelLogoutUrl == null) {
            this.frontchannelLogoutUrl = "";
        }
        if (attrs.get("post.logout.redirect.uris") != null) {
            this.postLogoutRedirectUris = Arrays.stream(attrs.get("post.logout.redirect.uris").split("##")).toList();
        } else {
            this.postLogoutRedirectUris = new ArrayList<>();
        }

        this.id = clientRepresentation.getId();

        this.secret = clientRepresentation.getSecret();

        this.standardFlowEnabled = clientRepresentation.isStandardFlowEnabled();
        this.implicitFlowEnabled = clientRepresentation.isImplicitFlowEnabled();
        this.directAccessGrantsEnabled = clientRepresentation.isDirectAccessGrantsEnabled();
        this.serviceAccountsEnabled = clientRepresentation.isServiceAccountsEnabled();
        this.authorizationServicesEnabled = clientRepresentation.getAuthorizationServicesEnabled();

        this.managers = managers;
    }
}
