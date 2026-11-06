import { ActivityIndicator, View } from "react-native";
import AuthForm from "../../components/AuthForm";
import FriendsPanel from "../../components/FriendsPanel";
import { useSession } from "../../lib/useSession";

export default function Messages() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0d0d0d",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#f5c518" />
      </View>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return <FriendsPanel myId={session.user.id} />;
}