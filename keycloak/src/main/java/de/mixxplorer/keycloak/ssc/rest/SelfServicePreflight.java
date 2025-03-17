package de.mixxplorer.keycloak.ssc.rest;

import org.keycloak.services.cors.Cors;

import jakarta.ws.rs.OPTIONS;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

// Return CORS response for all sub paths.
public class SelfServicePreflight {

    /**
     CORS Preflight request.

     @return Response
     */
    @OPTIONS
    @Path("/{any:.*}")
    public Response answerCors() {
        return Cors.builder()
            .preflight()
            .allowedMethods("GET", "PUT", "POST", "DELETE", "OPTIONS")
            .exposedHeaders(Cors.DEFAULT_ALLOW_HEADERS)
            .auth()
            .add(Response.ok());
    }
}
