import { MotionProps, motion } from "framer-motion";
import { type ForwardedRef, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface PanelRootProps {
  className: string;
  style?: React.CSSProperties;
  id?: string;
  ref: ForwardedRef<HTMLDivElement>;
  children: React.ReactNode;
}

/**
 * This type is just copied from the inferred type of `forwardRef`.
 */
export type PanelRoot = React.ForwardRefExoticComponent<React.PropsWithoutRef<PanelRootProps>
  & React.RefAttributes<HTMLDivElement>>

export const motionPanelRoot = (motionProps: MotionProps) =>
  forwardRef<HTMLDivElement>((props, ref) => {
    return <motion.div {...motionProps} {...props} ref={ref} />;
  });

const divRoot: PanelRoot = forwardRef((props, ref) => {
  return <div {...props} ref={ref} />;
});
divRoot.displayName = "div";

export type PanelProps = {
  id?: string;
  noPadding?: boolean;
  noBorder?: boolean;
  className?: string;
  style?: React.CSSProperties;
  root?: PanelRoot;
  children: React.ReactNode;
};

const Panel: React.ForwardRefExoticComponent<
  PanelProps & React.RefAttributes<HTMLDivElement>
> = forwardRef((props: PanelProps, ref: ForwardedRef<HTMLDivElement>) => {
  const Root: PanelRoot = props.root ?? divRoot;
  return (
    <Root
      className={twMerge(
        "rounded-2xl bg-bg shadow-xl",
        !props.noPadding ? "p-4" : undefined,
        !props.noBorder ? "border border-dimmed-subtle" : "border-none",
        props.className ?? "",
      )}
      style={props.style}
      id={props.id}
      ref={ref}
    >
      {props.children}
    </Root>
  );
});
Panel.displayName = "Panel";

export default Panel;
