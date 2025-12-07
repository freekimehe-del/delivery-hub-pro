import { PSWGateway } from '../psw-gateway';
import { RuleEngine } from '../customs-engine';
import { DutyCalculator } from '../duty-engine';
import { TrackingService } from '../tracking';
import { FinancialSettlement } from '../financial';

export type OrchestratorContext = {
  consignmentId: string;
  payload: any;
};

export class LogisticsOrchestrator {
  constructor(
    private psw: PSWGateway,
    private rules: RuleEngine,
    private duty: DutyCalculator,
    private tracking: TrackingService,
    private financial: FinancialSettlement
  ) {}

  async handleImport(ctx: OrchestratorContext) {
    // 1. Validate and enrich via rules
    const ruleResult = await this.rules.evaluate(ctx.payload);

    // 2. Calculate duties
    const duties = await this.duty.calculate({
      hsCode: ctx.payload.hsCode,
      value: ctx.payload.value,
      weight: ctx.payload.weight,
    });

    // 3. Persist preliminary record (omitted: call to DB)

    // 4. Generate documents and submit to PSW
    const pswResp = await this.psw.submitGoodsDeclaration({
      ...ctx.payload,
      consignmentId: ctx.consignmentId,
      duties,
      ruleResult,
    });

    // 5. Trigger financial pre-authorization if required
    const psid = await this.financial.createPSID({ consignmentId: ctx.consignmentId, amount: duties.total });

    // 6. Start tracking and subscribe to events
    await this.tracking.startConsignment(ctx.consignmentId, ctx.payload);

    return { pswResp, psid };
  }
}

export default LogisticsOrchestrator;
