/** An amount in EGP with a small currency, so big salaries fit a stat card. */
export function Money({ n, sign = "" }: { n: number; sign?: string }) {
  return (
    <span className="h-money">
      {Math.round(n) ? sign : ""}
      {new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n))}
      <small> ج.م</small>
    </span>
  );
}
