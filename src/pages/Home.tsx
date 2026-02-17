import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
	return (
		<div className="flex-1 flex flex-col px-4 py-8 bg-background">
			<div className="container mx-auto max-w-5xl flex-1 flex flex-col gap-12">
				<section className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)] items-center pt-4 md:pt-8">
					<div className="space-y-7">
						<p className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 border border-sky-200">
							<span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
							Meeting Analyzer for Zoom
						</p>
						<div className="space-y-4">
							<h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">
								Turn every Zoom meeting into
								<span className="bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
									{' '}
									clear, actionable work.
								</span>
							</h1>
							<p className="text-sm md:text-base text-slate-700 max-w-xl leading-relaxed">
								Nifty Ai listens to your Zoom calls, extracts decisions and
								owners, and turns them into structured tasks so your team always
								knows what happens next—without extra admin.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-4">
							<Button
								asChild
								className="rounded-xl px-6 py-2.5 text-sm font-medium shadow-lg shadow-sky-500/30 bg-sky-600 hover:bg-sky-500"
							>
								<Link to="/signin" className="flex items-center gap-2">
									<span>Sign in with Zoom</span>
									<ArrowRight className="h-4 w-4 text-white" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="rounded-xl border-slate-300 bg-white text-slate-900 hover:bg-slate-50 text-sm"
							>
								<Link to="/user-guide">View user guide</Link>
							</Button>
						</div>
						<p className="text-[11px] text-slate-500 max-w-md">
							By signing in, you agree to our{' '}
							<Link
								to="/terms-of-use"
								className="underline underline-offset-2 hover:text-sky-700"
							>
								Terms of Use
							</Link>{' '}
							and{' '}
							<Link
								to="/privacy-policy"
								className="underline underline-offset-2 hover:text-sky-700"
							>
								Privacy Policy
							</Link>
							.
						</p>
					</div>

					<Card className="border-slate-200 bg-white/90 shadow-xl rounded-2xl">
						<CardContent className="p-6 md:p-7 space-y-5">
							<div className="space-y-1">
								<p className="text-[11px] uppercase tracking-[0.2em] text-sky-600/90">
									Why teams use Nifty Ai
								</p>
								<h2 className="text-base md:text-lg font-semibold text-slate-900">
									From messy calls to clean plans
								</h2>
							</div>
							<ul className="space-y-4 text-xs md:text-sm text-slate-700">
								<li className="flex gap-3">
									<span className="mt-1 h-1.5 w-4 rounded-full bg-linear-to-r from-sky-400 to-emerald-400" />
									<span>
										Automatically capture action items, owners, and due dates
										from your Zoom meetings.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1 h-1.5 w-4 rounded-full bg-linear-to-r from-sky-400 to-indigo-400" />
									<span>
										See a single, searchable history of decisions across
										meetings so nothing slips.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="mt-1 h-1.5 w-4 rounded-full bg-linear-to-r from-cyan-400 to-emerald-400" />
									<span>
										Share concise summaries with your team instead of full
										transcripts.
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</section>
			</div>
		</div>
	);
}
