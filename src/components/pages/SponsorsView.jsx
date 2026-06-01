import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { fetchSponsors } from '../../lib/strapiSponsors.js';
import { fetchSponsorsPage } from '../../lib/strapiSponsorsPage.js';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const parseHighlightedTitleSegments = (value) => {
  const text = typeof value === 'string' ? value : '';
  const segments = [];
  const regex = /<([^>]+)>/g;
  let lastIndex = 0;
  let match = regex.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), highlight: false });
    }

    segments.push({ text: match[1], highlight: true });
    lastIndex = regex.lastIndex;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlight: false });
  }

  if (segments.length === 0) {
    return [{ text, highlight: false }];
  }

  return segments;
};

const SponsorsView = () => {
  const [activeToast, setActiveToast] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [page, setPage] = useState({
    title: 'Fuel The <Innovation>',
    titleHighlightColor: '#5ddb27',
    body:
      "Radicubs is entirely funded by corporate sponsors, grants, and community donations. By partnering with us, you aren't just funding a robot—you are investing in the next generation of engineers, leaders, and innovators in North Texas.",
    buttons: [
      {
        label: 'Download Sponsorship',
        variant: 'primary',
        action: 'toast',
        href: '',
        openInNewTab: false,
        downloadFilename: '',
        hasGreenBorder: false,
      },
      {
        label: 'Contact Us Directly',
        variant: 'outline',
        action: 'link',
        href: 'mailto:radicubs@gmail.com',
        openInNewTab: false,
        downloadFilename: '',
        hasGreenBorder: false,
      },
      {
        label: 'Donate',
        variant: 'secondary',
        action: 'link',
        href: '',
        openInNewTab: false,
        downloadFilename: '',
        hasGreenBorder: true,
      },
    ],
    logosHeading: 'Trusted By Industry Leaders',
    waysHeading: 'Ways to Support',
    waysCards: [
      {
        title: 'Donation Matching',
        body: 'Encourage companies to match employee donations',
        listItems: [],
      },
      {
        title: 'Sponsorship',
        body: 'Financial support in exchange for visibility and partnership',
        listItems: [],
      },
      {
        title: 'Direct Donation',
        body: 'One-time or recurring financial contributions',
        listItems: [],
      },
      {
        title: 'Workspace & Tools',
        body: 'Providing workspace, tools, or equipment to support team operations',
        listItems: [],
      },
    ],
    benefitsHeading: 'Sponsorship Benefits',
    benefitsCards: [
      {
        title: 'Brand Visibility',
        body: '',
        listItems: [
          'Logo on our robot, team uniforms, and website',
          'Recognition at competitions and community events',
          'Mentions in press releases and social media',
        ],
      },
      {
        title: 'Community Impact',
        body: '',
        listItems: [
          'Support STEM education in our community',
          'Help develop future engineers and innovators',
          'Contribute to workforce development',
        ],
      },
      {
        title: 'Team Engagement',
        body: '',
        listItems: [
          'Opportunities for team demonstrations at your facility',
          'Mentorship and internship connections',
          'Invitations to team events and competitions',
        ],
      },
      {
        title: 'Tax Benefits',
        body: '',
        listItems: [
          'Tax-deductible contributions',
          'Documentation for corporate social responsibility initiatives',
          'Annual impact reports for your records',
        ],
      },
    ],
    statisticsText: 'Statistics',
    statisticsCards: [
      {
        value: '2,500+',
        label: 'Annual Reach',
        body: 'Your brand visible at massive community events, libraries, and schools.',
        listItems: [],
      },
      {
        value: '501(c)(3)',
        label: 'Tax Deductible',
        body: 'All sponsorships and donations are fully tax-deductible contributions.',
        listItems: [],
      },
      {
        value: '100%',
        label: 'Student Impact',
        body: 'Funds go directly to parts, competition fees, and community outreach.',
        listItems: [],
      },
    ],
  });

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setSponsorsLoading(true);
      const rows = await fetchSponsors({ signal: controller.signal });
      setSponsors(rows);
      setSponsorsLoading(false);
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      const next = await fetchSponsorsPage({ signal: controller.signal });
      if (next) setPage((prev) => ({ ...prev, ...next }));
    })();

    return () => controller.abort();
  }, []);

  const handleButtonAction = (btn) => {
    const action = typeof btn?.action === 'string' ? btn.action.trim().toLowerCase() : '';
    const href = typeof btn?.href === 'string' ? btn.href.trim() : '';

    if (action === 'toast') {
      setActiveToast(btn);
      return;
    }

    if (action === 'link') {
      if (!href) return;

      if (btn?.openInNewTab) {
        window.open(href, '_blank', 'noreferrer');
      } else {
        window.location.href = href;
      }
      return;
    }

    if (action === 'download') {
      const downloadHref = btn?.fileUrl || href || (typeof btn?.downloadFilename === 'string' ? btn.downloadFilename.trim() : '');
      if (!downloadHref) return;

      const a = document.createElement('a');
      a.href = downloadHref;

      const filename = typeof btn?.downloadFilename === 'string' ? btn.downloadFilename.trim() : '';
      if (filename) a.download = filename;

      if (btn?.openInNewTab) {
        a.target = '_blank';
        a.rel = 'noreferrer';
      }

      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const shouldRenderButton = (btn) => {
    const action = typeof btn?.action === 'string' ? btn.action.trim().toLowerCase() : '';

    if (action === 'toast') return true;
    if (action === 'link') return isNonEmptyString(btn?.href);
    if (action === 'download') return isNonEmptyString(btn?.fileUrl) || isNonEmptyString(btn?.href) || isNonEmptyString(btn?.downloadFilename);

    return false;
  };

  const titleSegments = parseHighlightedTitleSegments(page.title);
  const highlightColor = isNonEmptyString(page.titleHighlightColor)
    ? page.titleHighlightColor.trim()
    : '#5ddb27';

  return (
    <div className="w-full pt-24 bg-[#101215] min-h-screen relative">
      <section className="px-6 md:px-16 lg:px-24 max-w-5xl mx-auto text-center mb-16 fade-in-up">
        <h2 className="text-4xl md:text-6xl font-mono font-bold text-white mb-6">
          {titleSegments.map((segment, index) =>
            segment.highlight ? (
              <span key={index} style={{ color: highlightColor }}>
                {segment.text}
              </span>
            ) : (
              <span key={index}>{segment.text}</span>
            )
          )}
        </h2>
        <p className="text-xl text-[#d3d3d3] leading-relaxed mb-10">
          {page.body}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {page.buttons
            .filter(shouldRenderButton)
            .map((btn, idx) => (
              <Button
                key={idx}
                variant={btn.variant}
                className={btn.hasGreenBorder ? 'border border-[#5ddb27] hover:border-[#5ddb27]' : ''}
                onClick={() => handleButtonAction(btn)}
              >
                {btn.label}
              </Button>
            ))}
        </div>
      </section>

      <section className="py-16 bg-[#1b1d23] border-y border-[#2c303a] mb-24">
        <div className="container mx-auto px-6">
          <h3 className="text-center font-mono text-[#a9a9a9] uppercase tracking-widest mb-12">
            {page.logosHeading}
          </h3>

          {!sponsorsLoading && sponsors.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-10 transition-all duration-500 max-w-6xl mx-auto">
              {sponsors.map((sponsor, i) => {
                const content = (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name || 'Sponsor logo'}
                    className="h-20 md:h-24 w-auto object-contain"
                    loading="lazy"
                  />
                );

                const wrapperClass = 'basis-1/2 md:basis-1/4 flex items-center justify-center';

                if (sponsor.website) {
                  return (
                    <a
                      key={i}
                      href={sponsor.website}
                      target="_blank"
                      rel="noreferrer"
                      className={wrapperClass}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={i} className={wrapperClass}>
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center border border-dashed border-[#2c303a] rounded py-12 font-mono text-[#a9a9a9] text-sm">
              Sponsor Logos Syncing...
            </div>
          )}
        </div>
      </section>

      <section className="px-6 md:px-16 lg:px-24 max-w-6xl mx-auto mb-24">
        <div className="mb-24">
          <h3 className="text-3xl font-mono text-white mb-10 text-center">{page.waysHeading}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {page.waysCards.map((card, idx) => (
              <Card key={idx} className="!bg-[#1b1d23] !border-[#2c303a] !p-8 text-left flex flex-col">
                <h4 className="font-mono text-xl text-[#5ddb27] mb-4">{card.title}</h4>
                {isNonEmptyString(card.body) && (
                  <p className="text-[#d3d3d3] text-sm leading-relaxed">{card.body}</p>
                )}
                {Array.isArray(card.listItems) && card.listItems.length > 0 && (
                  <ul className="space-y-2 text-[#d3d3d3] text-sm mt-4">
                    {card.listItems.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-mono text-white mb-10 text-center">{page.benefitsHeading}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {page.benefitsCards.map((card, idx) => (
              <div key={idx} className="bg-[#1b1d23] border border-[#2c303a] p-8 rounded-lg">
                <h4 className="font-mono text-xl text-[#5ddb27] mb-4">{card.title}</h4>
                {isNonEmptyString(card.body) && (
                  <p className="text-[#d3d3d3] text-sm leading-relaxed mb-4">{card.body}</p>
                )}
                <ul className="space-y-2 text-[#d3d3d3] text-sm">
                  {(Array.isArray(card.listItems) ? card.listItems : []).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#2c303a] mb-10" />

        <h3 className="text-3xl font-mono text-white mb-10 text-center">{page.statisticsText}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {page.statisticsCards.map((card, idx) => (
            <Card key={idx}>
              <div className="text-4xl font-mono text-white mb-2">{card.value}</div>
              <div className="text-[#5ddb27] font-mono text-sm uppercase mb-4">{card.label}</div>
              {isNonEmptyString(card.body) && (
                <p className="text-[#a9a9a9] text-sm">{card.body}</p>
              )}
              {Array.isArray(card.listItems) && card.listItems.length > 0 && (
                <ul className="space-y-2 text-[#a9a9a9] text-sm mt-4">
                  {card.listItems.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      </section>

      {activeToast && (
        <div className="fixed bottom-8 right-8 z-50 fade-in-up">
          <div className="bg-[#1b1d23] border border-[#2c303a] border-l-4 border-l-[#5ddb27] rounded-lg shadow-2xl p-6 max-w-sm flex flex-col gap-2 relative">
            <button
              onClick={() => setActiveToast(null)}
              className="absolute top-3 right-3 text-[#a9a9a9] hover:text-white transition-colors text-lg leading-none"
              aria-label="Close pop-up"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 text-[#5ddb27] font-mono font-bold mb-2">
              <FileText size={18} />
              <span>{activeToast.toastTitle}</span>
            </div>
            <p className="text-[#d3d3d3] text-sm leading-relaxed">
              {(() => {
                const text = activeToast.toastText || '';
                const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
                const parts = text.split(emailRegex);
                return parts.map((part, i) => {
                  if (part.match(emailRegex)) {
                    return (
                      <a
                        key={i}
                        href={`mailto:${part}`}
                        className="text-white hover:text-[#5ddb27] underline transition-colors"
                      >
                        {part}
                      </a>
                    );
                  }
                  return <React.Fragment key={i}>{part}</React.Fragment>;
                });
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorsView;
