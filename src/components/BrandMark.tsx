import appIcon from "../../app-icon.svg";

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark${small ? " brand-mark--small" : ""}`} aria-hidden="true">
      <img src={appIcon} alt="" />
    </span>
  );
}
