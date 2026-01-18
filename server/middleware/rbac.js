const { getDB } = require('../db');

// Check if user has permission
async function checkPermission(userId, userType, resource, action) {
    try {
        const db = await getDB();

        // Get user's roles
        const userRoles = await db.all(
            'SELECT role_id FROM user_roles WHERE user_id = ? AND user_type = ?',
            [userId, userType]
        );

        if (userRoles.length === 0) return false;

        const roleIds = userRoles.map(r => r.role_id);

        // Check if any role has the required permission
        const permission = await db.get(
            `SELECT rp.* FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.id
             WHERE rp.role_id IN (${roleIds.join(',')})
             AND p.resource = ? AND p.action = ?`,
            [resource, action]
        );

        return !!permission;
    } catch (error) {
        console.error('Permission check failed:', error);
        return false;
    }
}

// Middleware: Require Permission
function requirePermission(resource, action) {
    return async (req, res, next) => {
        try {
            // Extract user from JWT (assumes authenticateToken middleware ran first)
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const userId = req.user.id;
            const userType = req.user.type || 'ACADEMY';

            const hasPermission = await checkPermission(userId, userType, resource, action);

            if (!hasPermission) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

// Middleware: Require Any Permission (OR logic)
function requireAnyPermission(permissions) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const userId = req.user.id;
            const userType = req.user.type || 'ACADEMY';

            for (const perm of permissions) {
                const hasPermission = await checkPermission(userId, userType, perm.resource, perm.action);
                if (hasPermission) {
                    return next();
                }
            }

            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = {
    checkPermission,
    requirePermission,
    requireAnyPermission
};
