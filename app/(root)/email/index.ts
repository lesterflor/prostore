import { Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';
//import 'dotenv/config';
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
	await resend.emails.send({
		from: `${APP_NAME as string} <${SENDER_EMAIL as string}>`,
		to: [order.user.email],
		subject: `Order Confirmation ${order.id}`,
		react: PurchaseReceiptEmail({ order })
	});
};
