import useDecryptedDate from "../../hooks/useDecryptedDate";
import Settings from "./Settings";
const Dashboard = () => {
  const { decryptedDate } = useDecryptedDate();
  return (
    <div className="">
      <p>Decrypted Date: {decryptedDate ? decryptedDate : "Loading..."}</p>
      <Settings />
    </div>
  );
};

export default Dashboard;
