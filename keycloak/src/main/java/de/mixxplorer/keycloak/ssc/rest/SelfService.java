package de.mixxplorer.keycloak.ssc.rest;

import org.keycloak.models.KeycloakSession;
import org.keycloak.services.resource.RealmResourceProvider;

public class SelfService implements RealmResourceProvider {
    private final KeycloakSession keycloakSession;

    public SelfService(KeycloakSession keycloakSession) {
        this.keycloakSession = keycloakSession;
    }

    @Override
    public Object getResource() {
        return new SelfServiceMainResource(this.keycloakSession);
    }

    @Override
    public void close() {}
}
