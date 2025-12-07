export type RuleContext = Record<string, any>;

export type RuleResult = {
  pass: boolean;
  reason?: string;
  details?: Record<string, any>;
};

export type Rule = {
  id: string;
  version: string;
  description?: string;
  evaluate: (ctx: RuleContext) => RuleResult | Promise<RuleResult>;
};

export class RuleEngine {
  private rules = new Map<string, Rule>();

  registerRule(rule: Rule) {
    this.rules.set(`${rule.id}@${rule.version}`, rule);
  }

  async evaluate(ruleId: string, ctx: RuleContext, version?: string): Promise<RuleResult> {
    const key = version ? `${ruleId}@${version}` : Array.from(this.rules.keys()).find(k => k.startsWith(`${ruleId}@`));
    if (!key) return { pass: false, reason: 'rule_not_found' };
    const rule = this.rules.get(key as string)!;
    return await rule.evaluate(ctx);
  }
}

export default RuleEngine;
