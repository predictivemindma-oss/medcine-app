import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // redirect to login if not authenticated
  },
});

export const config = {
  matcher: ["/Reservations/:path*", "/AddService/:path*"],
};
