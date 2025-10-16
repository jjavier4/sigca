export const  href = (key)=> {
    const routes = {
    ADMIN:"/admin",
    COMITE:"/committee",
    AUTOR:"/author",
    REVISOR:"/reviewer"
    }
    return routes[key] || "/";
}
