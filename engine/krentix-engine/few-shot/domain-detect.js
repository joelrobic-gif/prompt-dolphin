/**
 * src/prompt-engineer/few-shot/domain-detect.js
 *
 * L99 PE-Phase 4-fix: domain inference for prompt content.
 *
 * Few-shot examples leak when an example from one domain (e.g. biotech
 * GLP-1) injects into a prompt about an unrelated domain (e.g. retail
 * viral marketing). This module tags prompts with one or more domain
 * labels so the example picker can filter to relevant examples only -
 * or, if no example matches, omit the example block entirely.
 *
 * Pure, deterministic, regex-based. Sub-ms.
 */

export const DOMAIN_DETECT_VERSION = '1.0.0';

export const KNOWN_DOMAINS = Object.freeze([
  'biotech', 'finance', 'enterprise', 'tech', 'consumer', 'retail',
  'marketing', 'legal', 'regulatory', 'hr', 'ops', 'security',
  'healthcare', 'energy', 'media', 'edu', 'gov', 'general',
]);

const DOMAIN_PATTERNS = Object.freeze({
  biotech: /\b(biotech|pharma(?:ceutical)?|clinical|trial|phase\s+[123]|fda|hc\b|health\s+canada|ema|tga|mhra|nda|bla|ind\b|cmc|gmp|glp\b|gxp|preclinical|oncology|cardiology|neurolog|rare\s+disease|orphan|gene\s+therapy|mrna|car-?t|adc\b|antibody|peptide|biologic|small\s+molecule|drug|catalyst|readout|pdufa)\b/i,
  finance: /\b(cfo|series\s+[a-d]|burn\s+rate|runway|valuation|term\s+sheet|cap\s+table|equity|sec\s+filing|10-?[kq]\b|earnings|ebitda|arr\b|mrr\b|p&l|p\/l|hedge\s+fund|portfolio|allocation|sharpe|drawdown|risk-adjusted|backtest|alpha|beta\b|ipo\b|m&a|acquisition|spac\b|private\s+equity|venture|sovereign\s+wealth)\b/i,
  enterprise: /\b(saas|enterprise|b2b|account-based|acv\b|tcv\b|nrr\b|churn|expansion|land-and-expand|qbr\b|customer\s+success|salesforce|marketo|hubspot|workday|servicenow|snowflake)\b/i,
  tech: /\b(api\b|sdk\b|opencv|kubernetes|docker|microservic|architect|database|schema|migration|refactor|debug|stack\s+trace|cache|queue|webhook|oauth|jwt\b|react|next\.?js|typescript|javascript|python|rust|golang|llm\b|model|inference|tokens?\b|embedding|vector\s+db|rag\b|fine-?tun|agent(?:ic)?|prompt\s+engineer|computer-use|tool\s+use|mcp\b)\b/i,
  consumer: /\b(consumer|d2c\b|dtc\b|cpg\b|brand|shopify|ecommerce|e-commerce|amazon\s+(?:fba|seller)|merchandis|inventory\s+management|sku\b|sell-through|gross\s+margin|return\s+rate|customer\s+acquisition|cac\b|ltv\b|loyalty)\b/i,
  retail: /\b(retail|store|storefront|brick-and-mortar|brick\s+and\s+mortar|boutique|merchandis|inventory|pos\b|point\s+of\s+sale|footfall|same-store\s+sales|customer\s+experience|shopper|apparel|fashion|beauty|cosmetic|skincare|home\s+goods|jewelry|jewellery)\b/i,
  marketing: /\b(market(?:ing)?|brand(?:ing)?|campaign|ad\s+spend|cac\b|conversion|funnel|seo\b|sem\b|paid\s+social|organic\s+social|influencer|creator|content|copy(?:writ)?|positioning|messaging|virality|viral|growth\s+hack|landing\s+page|hero\s+image|launch|go-?to-?market|gtm\b|product\s+marketing)\b/i,
  legal: /\b(legal|counsel|attorney|contract|nda\b|msa\b|sow\b|terms\s+of\s+service|privacy\s+policy|gdpr|hipaa|ccpa|sox\b|compliance|patent|trademark|copyright|ip\b|litigat|settlement|indemnif|liability|warrant|covenant)\b/i,
  regulatory: /\b(regulatory|regulation|submission|filing|disclosur|sec\b|finra|cftc|nfa\b|fcc\b|ofcom|cnil|dpo\b|compliance\s+(?:officer|review)|audit|sox\b|gdpr|hipaa|ccpa|kyc\b|aml\b|sanctions|fcpa|antitrust|ftc\b)\b/i,
  hr: /\b(hiring|recruit|headcount|onboard|offboard|performance\s+review|comp(?:ensation)?|equity\s+grant|stock\s+option|rsus?\b|employee|payroll|benefit|peo\b|peoplesoft|workday\s+hr|reduction\s+in\s+force|layoff|severance)\b/i,
  ops: /\b(operations|supply\s+chain|logistics|warehous|inventory|fulfillment|manufacturing|cdmo|cmo\b|cro\b|3pl\b|s&op|forecast(?:ing)?|capacity|throughput|utilization|tariff|trade|customs|port\b|freight)\b/i,
  security: /\b(security|secur(?:ed|ity)|threat|vulnerab|exploit|cve\b|owasp|pentest|red\s+team|incident\s+response|soc\b|siem|cert(?:ificate)?\s+rotation|secret(?:s)?\s+rotat|key\s+management|encryption|tls\b|mtls\b|0auth|zero\s+trust|breach|ransomware|malware)\b/i,
  healthcare: /\b(healthcare|hospital|clinic|payer|provider|patient|emr|ehr\b|hipaa|hl7|fhir|cpt\s+code|icd-?10|medicaid|medicare|cms\b|copay|deductible|prior\s+auth)\b/i,
  energy: /\b(energy|oil|gas|lng\b|renewable|solar|wind|battery|grid|ev\b|charging|electric\s+vehicle|carbon|emissions|esg\b|net\s+zero|opec|utility)\b/i,
  media: /\b(media|publish|editor|newsroom|journalism|podcast|youtube|tiktok|instagram|reels|short(?:s|-form)|long-?form|streaming|netflix|paramount|disney|spotify|advertisement|cpm\b)\b/i,
});

/**
 * Detect probable domains for a piece of text. Returns array of domain
 * tags from KNOWN_DOMAINS ordered by match count desc. Empty array if
 * no domain pattern matched - treat as 'general'.
 */
export function detectDomains(text) {
  const s = String(text || '');
  if (!s) return [];
  const hits = {};
  for (const [domain, pattern] of Object.entries(DOMAIN_PATTERNS)) {
    const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
    const matches = s.match(new RegExp(pattern.source, flags));
    if (matches && matches.length > 0) {
      hits[domain] = matches.length;
    }
  }
  const sorted = Object.entries(hits).sort((a, b) => b[1] - a[1]).map((e) => e[0]);
  return sorted;
}

/**
 * True if any of the example's domain tags overlap with promptDomains.
 * If example has no domain tags - structural-only, universally safe.
 * If promptDomains empty - no signal, conservative pass (let example through).
 */
export function exampleMatchesPrompt(exampleDomains, promptDomains) {
  if (!Array.isArray(exampleDomains) || exampleDomains.length === 0) return true;
  if (!Array.isArray(promptDomains) || promptDomains.length === 0) return true;
  return exampleDomains.some((d) => promptDomains.includes(d));
}
