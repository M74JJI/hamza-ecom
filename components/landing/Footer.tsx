export default function Footer(){
  return (
    <footer className="bg-black text-white mt-12">
      <div className="container py-12 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p>Premium e-commerce experience built with Next.js</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Links</h3>
          <ul className="space-y-1">
            <li><a href="#">Contact</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Follow Us</h3>
          <p>Coming soon...</p>
        </div>
      </div>
      <div className="text-center py-4 border-t border-white/10 text-xs">&copy; 2025 Hajzen Store</div>
    </footer>
  );
}
