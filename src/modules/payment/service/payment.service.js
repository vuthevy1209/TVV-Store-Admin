const PaymentDetails = require('../model/paymentDetails');
const PaymentType = require('../model/paymentType');
const VNPayDetails = require('../model/vnpayDetails');

const PaymentTypeEnums = require('../enum/payment.enum');



class PaymentService {
    async createPayment(order, paymentType) {
        const paymentDetail = await PaymentDetails.create({
            order_id: order.id,
            payment_type_id: paymentType
        });

    }

    async findAllTypes() {
        return await PaymentType.findAll();
    }

    async createVNPayDetails(orderId,vnp_Params) {
        const paymentDetails = await PaymentDetails.create({
            order_id: orderId,
            amount: vnp_Params.vnp_Amount,
            payment_type_id: PaymentTypeEnums.VNPAY,
            status: 'paid'
        });
        await VNPayDetails.create({
            payment_detail_id: paymentDetails.id,
            vnp_TransactionNo: vnp_Params.vnp_TransactionNo
        });
    }

    async getPaymentDetailsByOrderId(orderId) {
        return PaymentDetails.findOne({
            where: {
                order_id: orderId
            }
        });
    }    

    async deletePaymentDetailsByOrderId(orderId) {
        
        return PaymentDetails.destroy({
            where: {
                order_id: orderId
            }
        });
    }

    

}

module.exports = new PaymentService();