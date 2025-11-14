export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/Reservations/:path*", "/AddService/:path*"],
};