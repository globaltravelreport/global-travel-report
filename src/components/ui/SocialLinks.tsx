import { FaFacebook, FaXTwitter, FaLinkedin } from "react-icons/fa6";

interface SocialLinksProps {
  className?: string;
  iconSize?: string;
  showLabels?: boolean;
}

export function SocialLinks({
  className = "",
  iconSize = "w-4 h-4",
  showLabels = false
}: SocialLinksProps) {
  const socialPlatforms = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/globaltravelreport",
      icon: FaFacebook,
      ariaLabel: "Follow us on Facebook"
    },
    {
      name: "X (Twitter)",
      href: "https://x.com/GTravelReport",
      icon: FaXTwitter,
      ariaLabel: "Follow us on X (Twitter)"
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/globaltravelreport/",
      icon: FaLinkedin,
      ariaLabel: "Follow us on LinkedIn"
    }
  ];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {socialPlatforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#C9A14A] transition-colors"
          aria-label={platform.ariaLabel}
        >
          <platform.icon className={iconSize} />
          {showLabels && (
            <span className="sr-only">{platform.name}</span>
          )}
        </a>
      ))}
    </div>
  );
}