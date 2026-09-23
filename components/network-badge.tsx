import { cn } from "@/lib/cn";

interface BadgeNetwork {
  id: string;
  name: string;
  bg: string;
  fg: string;
  logo?: string;
}

/**
 * A network's mark: the official logo when one is configured
 * (NETWORKS[].logo), otherwise a drawn badge in the network's own colours —
 * MTN's yellow with its oval, Airtel's red, Glo's green, 9mobile's green.
 */
export function NetworkBadge({
  network,
  size = 48,
  className,
}: {
  network: BadgeNetwork;
  size?: number;
  className?: string;
}) {
  if (network.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny static brand mark
      <img
        src={network.logo}
        alt=""
        width={size}
        height={size}
        className={cn("rounded-full object-contain", className)}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("rounded-full", className)}
    >
      <circle cx="24" cy="24" r="24" fill={network.bg} />
      {network.id === "mtn" && (
        <>
          <ellipse
            cx="24"
            cy="24"
            rx="18"
            ry="11"
            fill="none"
            stroke={network.fg}
            strokeWidth="2.2"
          />
          <text
            x="24"
            y="28"
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill={network.fg}
            fontFamily="Arial, Helvetica, sans-serif"
            letterSpacing="0.5"
          >
            MTN
          </text>
        </>
      )}
      {network.id === "airtel" && (
        <>
          <path
            d="M17 17c4-5 13-5 16 1"
            fill="none"
            stroke={network.fg}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <text
            x="24"
            y="32"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill={network.fg}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            airtel
          </text>
        </>
      )}
      {network.id === "glo" && (
        <>
          <circle
            cx="24"
            cy="24"
            r="17"
            fill="none"
            stroke={network.fg}
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          <text
            x="24"
            y="29"
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill={network.fg}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            glo
          </text>
        </>
      )}
      {network.id === "9mobile" && (
        <>
          <text
            x="24"
            y="25"
            textAnchor="middle"
            fontSize="16"
            fontWeight="800"
            fill={network.fg}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            9
          </text>
          <text
            x="24"
            y="34"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="700"
            fill={network.fg}
            fontFamily="Arial, Helvetica, sans-serif"
          >
            mobile
          </text>
        </>
      )}
    </svg>
  );
}
