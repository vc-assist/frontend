import { LoadingAnimation } from "@/ui";
import * as React from "react";

export function LoadingPage() {
	const [showAnimation, setShowAnimation] = React.useState(false);

	React.useEffect(() => {
		const id = setTimeout(() => {
			setShowAnimation(true);
		}, 1000);
		return () => clearTimeout(id);
	}, []);

	if (showAnimation) {
		return <LoadingAnimation />;
	}
	return <></>;
}
