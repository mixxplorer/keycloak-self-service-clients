package de.mixxplorer.keycloak.ssc;

import org.jboss.logging.Logger;
import org.keycloak.models.ClientModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.UserModel;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;
import java.util.List;

import static de.mixxplorer.keycloak.ssc.Constants.CLIENT_USER_SSC_MANAGER_ATTRIBUTE_PREFIX;
import static de.mixxplorer.keycloak.ssc.Constants.CLIENT_USER_SSC_MANAGER_ATTRIBUTE_VALUE;

public class Util {
    private static final Logger logger = Logger.getLogger(Util.class);

    public static Map<String, String> getUserManageClientAttributeMap(UserModel user) {
        final HashMap<String, String> map = new HashMap<>();
        map.put(CLIENT_USER_SSC_MANAGER_ATTRIBUTE_PREFIX + user.getId(), CLIENT_USER_SSC_MANAGER_ATTRIBUTE_VALUE);
        return map;
    }

    static List<String> managerAttributes(ClientModel model) {
        List<String> attributes = new ArrayList<String>();
        for (Map.Entry<String, String> attribute : model.getAttributes().entrySet()) {
            if (
                attribute.getKey().startsWith(CLIENT_USER_SSC_MANAGER_ATTRIBUTE_PREFIX)
                && attribute.getValue().equals(CLIENT_USER_SSC_MANAGER_ATTRIBUTE_VALUE)
            ) {
                attributes.add(attribute.getKey());
            }
        }
        return attributes;
    }

    /**
     * Clear access for all managers of self-service-clients.
     *
     * @param model The client of which to clear the managers.
     */
    static void clearAccess(ClientModel model) {
        logger.debugf("Clearing access to client %s", model.getClientId());
        var managerAttributes = managerAttributes(model);
        for (var attribute : managerAttributes) {
            model.removeAttribute(attribute);
        }
    }

    // checks whether a user has access to manage a (self service) client
    public static boolean hasUserAccessToClient(ClientModel model, UserModel user) {
        logger.debugf("Checking whether user with ID %s has access to client with ID %s.", user.getId(), model.getClientId());
        for (Map.Entry<String, String> attrSet: getUserManageClientAttributeMap(user).entrySet()) {
            String clientAttribute = model.getAttribute(attrSet.getKey());
            if (clientAttribute == null || !clientAttribute.equals(attrSet.getValue())) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get the ID of users that were allowed to acces this client.
     *
     * @param model The client to check the allowed users for.
     * @return The list of user IDs.
     */
    public static Stream<String> getClientManagerIDs(ClientModel model) {
        final List<String> users = new ArrayList<>();
        for (var attribute : model.getAttributes().entrySet()) {
            if (
                attribute.getKey().startsWith(CLIENT_USER_SSC_MANAGER_ATTRIBUTE_PREFIX)
                && attribute.getValue().equals(CLIENT_USER_SSC_MANAGER_ATTRIBUTE_VALUE)
            ) {
                users.add(attribute.getKey().substring(CLIENT_USER_SSC_MANAGER_ATTRIBUTE_PREFIX.length()));
            }
        }

        return users.stream();
    }

    /**
     * Return the list of usernames that are managers of the client.
     *
     * @param model The client to find managers for.
     * @param session The current logged in user's session.
     * @return A list of usernames.
     */
    public static Stream<String> getManagerNames(ClientModel model, KeycloakSession session) {
        return getClientManagerIDs(model).map(id -> session.users().getUserById(model.getRealm(), id))
            // Filter out non-existent users (deleted, wrong ID, etc.)
            .filter(Objects::nonNull)
            .map(user -> user.getUsername());
    }

    /**
     * Set the managers of a client.
     *
     * @param client The client to set the managers of.
     * @param newManagers The users that shall have access to the client.
     * @param currentUser The current user.
     * @throws BadRequestException When the list of managers is invalid.
     */
    static void setManagersByUsers(ClientModel client, List<UserModel> newManagers, UserModel currentUser) throws BadRequestException {
        // Assumption: A self-service-client without manager does not make sense.
        if (newManagers.size() == 0) {
            logger.debugf("Refusing to clear all managers for client %s.", client.getClientId());
            throw new BadRequestException("Client needs at least one manager.");
        }
        
        // Assumption: The current user cannot be removed as a manager.
        logger.debugf("clients: %s -> %s", newManagers, newManagers.stream().anyMatch(user -> user.getId().equals(currentUser.getId())));
        if (!newManagers.stream().anyMatch(user -> user.getId().equals(currentUser.getId()))) {
            logger.debugf("Refusing to remove current user as manager for client %s.", client.getClientId());
            throw new BadRequestException("The current user must be manager of this client and cannot be removed.");
        }

        // Temporarily clean all managers to replace them later.
        clearAccess(client);

        logger.debugf(
            "Setting managers for client %s: %s",
            client.getClientId(),
            newManagers.stream().map(u -> u.getUsername()).toList()
        );

        newManagers.forEach(user -> {
            final Map<String, String> clientAttribute = getUserManageClientAttributeMap(user);
            clientAttribute.forEach((key, value) -> client.setAttribute(key, value));
        });
    }

    /**
     * Set the client's managers.
     *
     * @param client The client to set the managers for.
     * @param newManagers The list of usernames(!) that may edit the client.
     * @param currentUser The current user.
     * @param session The current user's session.
     * @throws NotFoundException When a user was not found.
     * @throws BadRequestException When the list of managers is invalid.
     */
    public static void setManagersByUsername(
        ClientModel client,
        List<String> newManagers,
        UserModel currentUser,
        KeycloakSession session
    ) throws NotFoundException, BadRequestException {
        logger.debugf(
            "Setting managers by username for client %s: %s",
            client.getClientId(),
            newManagers
        );

        final List<UserModel> users = new ArrayList<>();

        for (String username : newManagers) {
            final UserModel user = session.users().getUserByUsername(client.getRealm(), username);
            if (user == null) {
                logger.debugf("Did not find user: %s", username);
                throw new NotFoundException("The user " + username + " was not found");
            }
            users.add(user);
        }

        setManagersByUsers(client, users, currentUser);
    }
}
