export default function Footer() {
  return (
    <footer className="border-t mt-auto py-6 bg-gray-50">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} LiveTrackAPI. All rights reserved.</p>
      </div>
    </footer>
  );
}
