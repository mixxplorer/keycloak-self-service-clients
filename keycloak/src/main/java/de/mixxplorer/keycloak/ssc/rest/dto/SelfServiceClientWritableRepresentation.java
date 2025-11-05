package de.mixxplorer.keycloak.ssc.rest.dto;

import jakarta.ws.rs.BadRequestException;
import org.keycloak.representations.idm.ClientRepresentation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


// see ClientRepresentation for all options
public class SelfServiceClientWritableRepresentation {
    public String clientId;
    public String name;
    public String description;
    public String rootUrl;
    public String baseUrl;
    public Boolean enabled;
    public List<String> redirectUris;
    public List<String> webOrigins;

    public Boolean publicClient;
    public Boolean frontchannelLogout;
    // we do not allow setting attributes directly, but allow setting some of them explicitly
    // public Map<String, String> attributes;
    public Boolean backchannelLogoutRevokeOfflineTokens;
    public Boolean backchannelLogoutSessionRequired;
    public String backchannelLogoutUrl;
    public String frontchannelLogoutUrl;
    public List<String> postLogoutRedirectUris;
    // The usernames of users that may edit this client.
    public List<String> managers;

    // Validate passed values before creating an official ClientRepresentation
    void validatePlainValues() {
        if (!this.clientId.startsWith("ssc-")) {
            throw new BadRequestException("Client ID must start with 'ssc-'");
        }
    }

    public ClientRepresentation toClientRepresentation() {
        this.validatePlainValues();

        ClientRepresentation clientRepresentation = new ClientRepresentation();
        clientRepresentation.setClientId(this.clientId);
        clientRepresentation.setName(this.name);
        clientRepresentation.setDescription(this.description);
        clientRepresentation.setRootUrl(this.rootUrl);
        clientRepresentation.setBaseUrl(this.baseUrl);
        clientRepresentation.setEnabled(this.enabled);
        clientRepresentation.setRedirectUris(this.redirectUris);

        clientRepresentation.setWebOrigins(this.webOrigins);

        clientRepresentation.setPublicClient(this.publicClient);
        clientRepresentation.setFrontchannelLogout(this.frontchannelLogout);

        // it is important here that we did not set any attributes before this line
        // otherwise get them via clientRepresentation.getAttributes()
        Map<String, String> attrs = new HashMap<>();
        if (this.backchannelLogoutRevokeOfflineTokens != null) {
            attrs.put("backchannel.logout.revoke.offline.tokens", this.backchannelLogoutRevokeOfflineTokens ? "true" : "false");
        }

        if (this.backchannelLogoutSessionRequired != null) {
            attrs.put("backchannel.logout.session.required", this.backchannelLogoutSessionRequired ? "true" : "false");
        }

        if (this.backchannelLogoutUrl != null) {
            attrs.put("backchannel.logout.url", this.backchannelLogoutUrl);
        }

        if (this.frontchannelLogoutUrl != null) {
            attrs.put("frontchannel.logout.url", this.frontchannelLogoutUrl);
        }

        if (this.postLogoutRedirectUris != null) {
            attrs.put("post.logout.redirect.uris", String.join("##", this.postLogoutRedirectUris));
        }

        clientRepresentation.setAttributes(attrs);

        return clientRepresentation;
    }
}
