export const getUserRole = (roles) => {
    if (roles & 0b1) {
        return 'Poet'
    }

    if (roles & 0b10) {
        return 'Admin'
    }

    return 'Regular'
}

export const isAdmin = (roles) => roles & 0b10
export const isPoet = (roles) => roles & 0b10
