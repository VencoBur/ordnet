
const team = [
  { name: "Charlie Lee", role: "Director", bio: "Founder of Litecoin. Former Google and Coinbase engineer." },
  { name: "Alan Austin", role: "Managing Director", bio: "Oversees operations and strategic initiatives globally." },
  { name: "Xinxi Wang", role: "Director", bio: "Long-time Litecoin contributor and ecosystem advocate." },
  { name: "David Schwartz", role: "Dir. of Strategic Partnerships", bio: "Building key relationships and adoption opportunities." },
  { name: "Keith Yong", role: "Operations Director", bio: "Day-to-day operations and community coordination." },
  { name: "Jay M", role: "Director of Marketing", bio: "Drives awareness, campaigns, and brand growth." },
  { name: "Robbie Coleman", role: "Creative Director", bio: "Design, visuals, and creative direction for the project." },
  { name: "Loshan T.", role: "Litecoin Developer", bio: "Core protocol development and technical improvements." },
  { name: "David Burkett", role: "Litecoin & MWEB Developer", bio: "Focus on privacy features and Mimblewimble extension blocks." },
  { name: "Claudia Iglesias", role: "Shop Manager & Support", bio: "Merchandise and community support operations." },
];

const volunteers = [
  "Omied — Education Ambassador",
  "Indigo — Crowdfund Manager",
  "Ryan Wright — Advisor",
  "Aldo — Content Editor",
  "Craig T — Digital Marketing Contributor",
  "Rebecca White — Contributor",
  "Jeremy Frey — Contributor",
  "Jon Moore — Merchant Ambassador",
  "Peter Weisbrot — Creative",
  "John Kim — Ambassador",
  "Brian Haggerty — Public Policy Coordinator",
  "Jim Flanagan — Contributor",
];

export default function InternalLitecoinFoundationPreview({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-[#111113] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#345D9D] to-[#00A3E0] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ł</span>
            </div>
            <div>
              <div className="font-semibold text-2xl tracking-tight">Litecoin Foundation</div>
              <div className="text-[10px] text-gray-400 -mt-0.5">Nonprofit • 501(c)(3)</div>
            </div>
          </div>
          <div className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Preview</div>
        </div>
      </div>

      {/* Hero / Mission */}
      <div className="px-6 pt-8 pb-6 bg-[#0a0a0f] flex-shrink-0 border-b border-gray-800">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Litecoin Foundation</h1>
          <p className="text-xl text-gray-300 leading-tight">
            A nonprofit organization whose mission is to promote the adoption, awareness &amp; development of Litecoin &amp; its ecosystem.
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Established in both Singapore and the US, the Foundation consists of full-time, part-time and volunteer support from around the globe.
          </p>
          <a href="#team" className="inline-block mt-4 text-sm text-[#00A3E0] hover:underline">Meet the team ↓</a>
        </div>
      </div>

      {/* Core Team */}
      <div id="team" className="px-6 py-6 flex-1 min-h-0 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 tracking-tight">Core Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <div key={i} className="bg-[#111113] border border-gray-800 rounded-xl p-4">
                <div className="font-semibold">{member.name}</div>
                <div className="text-xs text-[#00A3E0] mb-1.5">{member.role}</div>
                <div className="text-xs text-gray-400 leading-snug">{member.bio}</div>
              </div>
            ))}
          </div>

          {/* Key Contributors */}
          <h2 className="text-lg font-semibold mt-8 mb-4 tracking-tight">Key Contributors &amp; Volunteers</h2>
          <div className="bg-[#111113] border border-gray-800 rounded-xl p-4 text-sm text-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            {volunteers.map((v, i) => <div key={i}>• {v}</div>)}
          </div>

          {/* Contact & Get Involved */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Contact us</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <div>For partnerships, business or general enquiries: <a href="mailto:contact@litecoin.com" className="text-[#00A3E0]">contact@litecoin.com</a></div>
                <div className="pt-1">Litecoin Foundation Ltd. (UEN: 201709179W)<br />111 North Bridge Road, #08-11 Peninsula Plaza, Singapore 179098</div>
                <div className="pt-1">Litecoin Foundation Inc. (EIN: 88-1262826)<br />2219 Main St #584, Santa Monica, CA 90405</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Get involved</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium">Donate</div>
                  <div className="text-gray-400">As a nonprofit the Foundation relies on community generosity. <span className="text-[#00A3E0] cursor-pointer">Make a donation →</span></div>
                </div>
                <div>
                  <div className="font-medium">Newsletter</div>
                  <div className="text-gray-400">Monthly updates with announcements, opportunities and exclusive Litecoin news.</div>
                </div>
                <div>
                  <div className="font-medium">Volunteer</div>
                  <div className="text-gray-400">Use your expertise to promote, develop or grow Litecoin. <span className="text-[#00A3E0] cursor-pointer">I'd like to volunteer →</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-[10px] text-center text-gray-500 border-t border-gray-800 bg-[#111113] flex-shrink-0">
        © Litecoin Foundation • Internal OrdNET Preview • Matches litecoin.com/litecoin-foundation layout &amp; content
      </div>
    </div>
  );
}
