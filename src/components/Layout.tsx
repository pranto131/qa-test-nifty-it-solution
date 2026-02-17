// ZOOM API COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import { zoomApi } from '@/services/api';
import {
	// PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
	// BarChart3,
	BookOpen,
	CheckSquare,
	Database,
	FileText,
	HelpCircle,
	History,
	LayoutDashboard,
	LogOut,
	Settings,
	Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { logout } from '@/store/slices/authSlice';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/confirm-dialog';

interface LayoutProps {
	children: React.ReactNode;
}

const authenticatedNavigation = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Tasks', href: '/tasks', icon: CheckSquare },
	{ name: 'History', href: '/history', icon: History },
	{ name: 'Knowledge Base', href: '/knowledge-base', icon: Database },
	// PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
	// {
	// 	name: 'Pipeline Evaluations',
	// 	href: '/pipeline-evaluations',
	// 	icon: BarChart3,
	// },
	{ name: 'Settings', href: '/settings', icon: Settings },
];

const publicNavigation = [
	{ name: 'Privacy Policy', href: '/privacy-policy', icon: Shield },
	{ name: 'Terms of Use', href: '/terms-of-use', icon: FileText },
	{ name: 'User Guide', href: '/user-guide', icon: BookOpen },
	{ name: 'Support', href: '/support', icon: HelpCircle },
];

export default function Layout({ children }: LayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [disconnecting, setDisconnecting] = useState(false);
	const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	const isSignInPage = location.pathname === '/signin';
	const appRoutes = [
		'/dashboard',
		'/tasks',
		'/history',
		'/knowledge-base',
		// PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
		// '/pipeline-evaluations',
		'/settings',
	];
	const isOnAppRoute = appRoutes.some((route) =>
		location.pathname.startsWith(route)
	);
	const isAuthenticatedView = isAuthenticated || isOnAppRoute;

	const handleSignOutClick = () => {
		setSignOutDialogOpen(true);
	};

	const handleSignOutConfirm = async () => {
		setDisconnecting(true);
		try {
			// Dispatch logout action (clears token and auth state)
			dispatch(logout());
			// Redirect to sign-in page after successful logout
			navigate('/signin');
			// Reset disconnecting state after navigation
			setDisconnecting(false);
		} catch (error: any) {
			console.error('Error signing out:', error);
			toast.error('Error signing out. Please try again.');
			setDisconnecting(false);
		}
	};

	// Reset disconnecting state when user becomes authenticated (e.g., after signing back in)
	useEffect(() => {
		if (isAuthenticated && disconnecting) {
			setDisconnecting(false);
		}
	}, [isAuthenticated, disconnecting]);

	// Determine which navigation to show
	// When not authenticated, show public navigation
	// When authenticated (or on an authenticated route), show authenticated navigation
	const navigationToShow = isAuthenticatedView
		? authenticatedNavigation
		: publicNavigation;
	// Show nav when not on the sign-in page
	const shouldShowNav = !isSignInPage;

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{shouldShowNav && (
				<nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b relative">
					<div className="container mx-auto px-4">
						<div className="flex h-16 items-center justify-between">
							<div className="flex items-center gap-2">
								<Link
									to={isAuthenticatedView ? '/dashboard' : '/'}
									className="flex items-center"
									aria-label={
										isAuthenticatedView ? 'Go to dashboard' : 'Go to home'
									}
								>
									<img
										src="/niftyai.svg"
										alt="Nifty Ai"
										className="h-9 w-auto cursor-pointer hover:opacity-80 transition-opacity"
									/>
								</Link>
							</div>
							<div className="flex items-center gap-2 h-full">
								{navigationToShow.map((item) => {
									const Icon = item.icon;
									const isActive = location.pathname === item.href || 
										(item.href !== '/' && location.pathname.startsWith(item.href + '/'));
									return (
										<div key={item.name} className="relative h-full flex items-center">
											<Button
												asChild
												variant={isActive ? 'default' : 'ghost'}
												size="sm"
											>
												<Link to={item.href} className="flex items-center gap-2 relative">
													<Icon className="h-4 w-4" />
													{item.name}
												</Link>
											</Button>
											{isActive && (
												<div 
													className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400 z-20 rounded-t-full" 
												/>
											)}
										</div>
									);
								})}
								{!isAuthenticated && !isSignInPage && (
									<Button
										asChild
										size="sm"
										variant="default"
										className="ml-3 rounded-xl px-4 border-0 bg-sky-600 hover:bg-sky-500 text-xs font-medium shadow-sm shadow-sky-500/30"
									>
										<Link to="/signin" className="flex items-center gap-2">
											<span>Sign In</span>
										</Link>
									</Button>
								)}
								{isAuthenticated && (
									<Button
										variant="outline"
										onClick={handleSignOutClick}
										disabled={disconnecting}
										className="ml-4 text-red-600 border-red-600 hover:text-red-700 hover:border-red-700"
									>
										<LogOut className="h-4 w-4 mr-2" />
										{disconnecting ? 'Signing out...' : 'Sign Out'}
									</Button>
								)}
							</div>
						</div>
					</div>
				</nav>
			)}
			<main
				className={`${
					isSignInPage ? 'overflow-hidden' : 'container mx-auto px-4 py-8'
				} flex-1 flex flex-col`}
			>
				{children}
			</main>
			<footer className="border-t">
				<div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
					<span>© {new Date().getFullYear()} Nifty Ai</span>
					<div className="flex items-center gap-4">
						<Link
							to="/privacy-policy"
							className="hover:text-foreground underline-offset-4 hover:underline"
						>
							Privacy Policy
						</Link>
						<Link
							to="/terms-of-use"
							className="hover:text-foreground underline-offset-4 hover:underline"
						>
							Terms of Use
						</Link>
						<Link
							to="/user-guide"
							className="hover:text-foreground underline-offset-4 hover:underline"
						>
							User Guide
						</Link>
						<Link
							to="/support"
							className="hover:text-foreground underline-offset-4 hover:underline"
						>
							Support
						</Link>
					</div>
				</div>
			</footer>

			<ConfirmDialog
				open={signOutDialogOpen}
				onOpenChange={setSignOutDialogOpen}
				title="Sign Out"
				description="Are you sure you want to sign out? You will be redirected to the sign-in page."
				confirmText="Sign Out"
				cancelText="Cancel"
				variant="default"
				onConfirm={handleSignOutConfirm}
			/>
		</div>
	);
}
