export const  href = (key)=> {
    const routes = {
    ADMIN:"/ciidici/admin",
    COMITE:"/ciidici/committee",
    AUTOR:"/ciidici/author",
    REVISOR:"/ciidici/reviewer"
    }
    return routes[key] || "/";
}
