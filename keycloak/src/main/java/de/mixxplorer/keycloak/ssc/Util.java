package de.mixxplorer.keycloak.ssc;

import org.keycloak.models.ClientModel;
import org.keycloak.models.UserModel;

import java.util.HashMap;
import java.util.Map;

import static de.mixxplorer.keycloak.ssc.Constants.CLIENT_USER_SSC_MANAGER_ATTRIBUTE_PREFIX;
import static de.mixxplorer.keycloak.ssc.Constants.CLIENT_USER_SSC_MANAGER_ATTRIBUTE_VALUE;

public class Util {
    public static Map<String, String> getUserManageClientAttributeMap(UserModel user) {
        final HashMap<String, String> map = new HashMap<>();
        map.put(CLIENT_USER_SSC_MANAGER_ATTRIBUTE_PREFIX + user.getId(), CLIENT_USER_SSC_MANAGER_ATTRIBUTE_VALUE);
        return map;
    }

    // checks whether a user has access to manage a (self service) client
    public static boolean hasUserAccessToClient(ClientModel model, UserModel user) {
        for (Map.Entry<String, String> attrSet: getUserManageClientAttributeMap(user).entrySet()) {
            String clientAttribute = model.getAttribute(attrSet.getKey());
            if (clientAttribute == null || !clientAttribute.equals(attrSet.getValue())) {
                return false;
            }
        }
        return true;
    }
}
