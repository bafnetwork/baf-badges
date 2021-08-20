import { providers } from 'near-api-js';
import { UnexpectedTxOutcomeError } from './errors';
import { nearConfig } from './init';

export enum TxStatus {
	NOT_STARTED,
	PENDING,
	SUCCEEDED,
	FAILED
}

export interface TxStatusInfo {
	status: TxStatus;
	inner: providers.FinalExecutionOutcome;
	explorerUrl?: string;
}

const POLL_INTERVAL = 800;
const MAX_POLLS = 10;

const provider = new providers.JsonRpcProvider(nearConfig.nodeUrl);

export const getExplorerUrl = (txHash: string) => nearConfig.explorerUrl ? `${nearConfig.explorerUrl}/transactions/${txHash}` : undefined;

export async function getTxStatus(txHash: string): Promise<TxStatusInfo> {
	const inner = await provider.txStatus(txHash, window.accountId);
	console.log(inner);
	const explorerUrl = getExplorerUrl(txHash);
	switch (inner.status) {
		case "Failure":
			return {
				status: TxStatus.FAILED,
				inner,
				explorerUrl
			}
		case "NotStarted":
			return {
				status: TxStatus.NOT_STARTED,
				inner,
				explorerUrl
			}
		case "Started":
			return {
				status: TxStatus.PENDING,
				inner,
				explorerUrl
			}
		default:
			const status = inner.status as providers.FinalExecutionStatus;
			if (!status.Failure && !status.SuccessValue) {
				throw UnexpectedTxOutcomeError(txHash, status);
			}
			if (status.Failure) {
				return {
					status: TxStatus.FAILED,
					inner,
					explorerUrl
				}
			} else {
				return {
					status: TxStatus.SUCCEEDED,
					inner,
					explorerUrl
				}
			}
	}
}

export function pollTxStatus(txHash: string, onNewStatus: (status: TxStatusInfo) => void | Promise<void>, async: boolean = false): () => void {
	let timeout: any;
	const poll = (n: number) => async () => {
		const statusInfo = await getTxStatus(txHash);
		onNewStatus(statusInfo);

		if (n < MAX_POLLS && (statusInfo.status === TxStatus.NOT_STARTED || statusInfo.status === TxStatus.PENDING)) {
			timeout = setTimeout(poll(n + 1), POLL_INTERVAL);
		}
	}
	timeout = setTimeout(poll(0), POLL_INTERVAL);
	return () => {
		clearTimeout(timeout);
	}
}
