import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
// import LogoutButton from "../components/LogoutButton";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <p>Unauthorized</p>;
    }

    return (
        <div className="p-5 text-center text-2xl">
            <h1>Bonjour {session.user.name}</h1>
            <p>Role: {session.user.role}</p>

            {/* <LogoutButton /> */}
        </div>
    );
}
