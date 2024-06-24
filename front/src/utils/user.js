const rolesSchema = {
    0b10: 'Admin',
    0b1: 'Poet',
}

export const getUserRole = (roles) => {
    let list = []

    for (const [bitmask, role] of Object.entries(rolesSchema)) {
        if (roles & bitmask) {
            list.push(role)
        }
    }

    return list.length == 0 ? 'Regular' : list.join(', ')
}

export const isAdmin = (roles) => roles & 0b10
export const isPoet = (roles) => roles & 0b10
