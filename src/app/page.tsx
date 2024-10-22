import RequestsGrid from "components/Request/Grid";

export default async function Home() {
  return (
    <div className="content-wide flex flex-col justify-center">
      <RequestsGrid />
    </div>
  );
}
