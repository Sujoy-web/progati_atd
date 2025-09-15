// ...existing code...
import SetupCard from "./SetupCard";

export default function SetupList(props) {
  const { setups } = props;

  return (
    <>
      {/* removed duplicate "+ Add Setup" button */}

      {setups.map((setup, idx) => (
        <SetupCard key={setup.id} setupIndex={idx} setup={setup} {...props} />
      ))}
    </>
  );
}
// ...existing code...
// ...existing code...