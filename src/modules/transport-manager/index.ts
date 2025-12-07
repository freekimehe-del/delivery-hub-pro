export type WorkflowContext = {
  shipmentId: string;
  data?: Record<string, any>;
};

export type WorkflowHandler = (ctx: WorkflowContext) => Promise<void> | void;

export class TransportManager {
  private workflows = new Map<string, WorkflowHandler>();

  registerWorkflow(mode: string, handler: WorkflowHandler) {
    this.workflows.set(mode, handler);
  }

  async start(mode: string, ctx: WorkflowContext) {
    const handler = this.workflows.get(mode);
    if (!handler) throw new Error(`workflow_not_registered:${mode}`);
    await handler(ctx);
  }
}

export default TransportManager;
