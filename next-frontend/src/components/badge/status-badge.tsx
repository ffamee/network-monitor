export const StatusBadge = ({ status }: { status: string }) => {
	const styles = {
		online: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
		offline: "bg-rose-500/10 text-rose-500 border-rose-500/20",
		warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
	};

	const labels = {
		online: "ปกติ",
		offline: "ออฟไลน์",
		warning: "แจ้งเตือน",
	};

	return (
		<span
			className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
				styles[status as keyof typeof styles] || styles.offline
			} flex items-center gap-1.5 w-fit`}
		>
			<span
				className={`w-1.5 h-1.5 rounded-full ${
					status === "online"
						? "bg-emerald-500"
						: status === "warning"
						? "bg-amber-500"
						: "bg-rose-500"
				}`}
			></span>
			{labels[status as keyof typeof labels]}
		</span>
	);
};
