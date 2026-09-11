import RoomViewer from '../../../components/RoomViewer';

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RoomViewer slug={slug} />;
}
