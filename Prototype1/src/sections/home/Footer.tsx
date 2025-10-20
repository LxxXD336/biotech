import { Link } from "react-router-dom";
import { COLORS } from "../../components/common";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: COLORS.green }}>
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6 text-white">
        <div>
          <h4 className="font-bold mb-2" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            BIOTech Futures
          </h4>
          <p className="text-white/90 text-sm" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            Inspiring the future leaders of science and innovation.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-2" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            Quick links
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:underline text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                About
              </Link>
            </li>
            <li>
              <a href="#" className="hover:underline text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                News
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                Privacy
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-2" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            Subscribe
          </h4>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 px-3 py-2 rounded-md text-black"
              style={{ border: `1px solid ${COLORS.lime}`, fontFamily: "Arial, Helvetica, sans-serif" }}
            />
            <button type="submit" className="px-4 py-2 rounded-md text-black hover:opacity-95 transition" style={{ backgroundColor: COLORS.yellow, fontFamily: "Arial, Helvetica, sans-serif" }}>
              Sign up
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}

