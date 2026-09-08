const fs = require('fs');
const file = 'client/src/pages/admin/AdminDashboard.jsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `{/* Segmented Progress Bar */}
                      <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-white/5">
                        {blackTierPct > 0 && <div style={{ width: \`\${blackTierPct}%\` }} className="bg-white transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />}
                        {obsidianTierPct > 0 && <div style={{ width: \`\${obsidianTierPct}%\` }} className="bg-amber-400 transition-all duration-1000 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />}
                        {trialTierPct > 0 && <div style={{ width: \`\${trialTierPct}%\` }} className="bg-blue-400 transition-all duration-1000 shadow-[0_0_8px_rgba(96,165,250,0.4)]" />}
                        {otherTierPct > 0 && <div style={{ width: \`\${otherTierPct}%\` }} className="bg-emerald-400 transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />}
                      </div>`;

const replacement = `{/* Recharts Pie Chart */}
                      <div className="h-48 w-full relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Black Tier', value: blackTierCount, color: '#ffffff' },
                                { name: 'Obsidian', value: obsidianTierCount, color: '#fbbf24' },
                                { name: 'Trial Pass', value: trialTierCount, color: '#60a5fa' },
                                { name: 'Custom', value: otherTierCount, color: '#34d399' }
                              ].filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              stroke="none"
                              dataKey="value"
                            >
                              {
                                [
                                  { name: 'Black Tier', value: blackTierCount, color: '#ffffff' },
                                  { name: 'Obsidian', value: obsidianTierCount, color: '#fbbf24' },
                                  { name: 'Trial Pass', value: trialTierCount, color: '#60a5fa' },
                                  { name: 'Custom', value: otherTierCount, color: '#34d399' }
                                ].filter(d => d.value > 0).map((entry, index) => (
                                  <Cell key={\`cell-\${index}\`} fill={entry.color} />
                                ))
                              }
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}
                              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync(file, code);
  console.log("Replaced Segmented Progress Bar with Recharts PieChart!");
} else {
  console.log("Could not find the target string!");
}
