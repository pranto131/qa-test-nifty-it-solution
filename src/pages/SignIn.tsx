import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginMutation } from '@/store/api/authApi';
import { login } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { Loader2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const [loginMutation, { isLoading: loading }] = useLoginMutation();

	// Check if already logged in
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard', { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		try {
			const response = await loginMutation({ username, password }).unwrap();
			if (response.token) {
				dispatch(login(response.token));
				navigate('/dashboard', { replace: true });
			} else {
				setError('Login failed. Please try again.');
			}
		} catch (err: any) {
			console.error('Error during login:', err);
			setError(err.data?.message || err.message || 'Invalid username or password');
		}
	};

	return (
		<div className="flex-1 flex flex-col px-4 py-8 bg-background text-slate-900">
			<div className="flex-1 max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 py-4">
				<div className="flex flex-col items-start gap-4 md:w-1/2">
					<div className="space-y-3">
						<p className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 border border-sky-200">
							<span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
							Secure authentication
						</p>
						<h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
							Sign in to turn meetings into momentum.
						</h1>
						<p className="text-sm md:text-base text-slate-700 max-w-xl leading-relaxed">
							Sign in to access Nifty Ai and analyze conversations,
							capture decisions, and keep your tasks perfectly organized.
						</p>
					</div>
				</div>

				<Card className="w-full max-w-md shadow-xl border-slate-200 bg-white/90 text-slate-900 rounded-2xl">
					<CardHeader className="text-center pb-4 space-y-3">
						<div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 border border-blue-200">
							<Lock className="h-5 w-5 text-blue-600" />
						</div>
						<CardTitle className="text-xl font-semibold text-slate-900">
							Sign In
						</CardTitle>
						<CardDescription className="text-xs text-slate-600 mt-1">
							Enter your credentials to access the dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<form onSubmit={handleLogin} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Enter username"
									required
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter password"
									required
									disabled={loading}
								/>
							</div>

							{error && (
								<div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
									{error}
								</div>
							)}

							<Button
								type="submit"
								className="w-full rounded-xl border-0 bg-sky-600 hover:bg-sky-500 text-sm font-medium shadow-lg shadow-sky-500/30 cursor-pointer transition-all duration-200"
								variant="default"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Signing in...
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>

						<p className="text-[11px] text-slate-500 text-center">
							Need help first?{' '}
							<a
								href="/user-guide"
								className="font-medium text-sky-700 hover:text-sky-800 underline underline-offset-2"
							>
								View user guide
							</a>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
