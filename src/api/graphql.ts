import axios from 'axios';

export function submitTransactionBody() {
  return `
    mutation submitTransaction(
        $transaction: String!
    ) {
        submitTransaction(transaction: $transaction) {
            hash
        }
    }
   `;
}

export async function submitTransaction(url: string, signedTxBinary: any) {
  let transactionQuery = submitTransactionBody();
  return await axios.post(url, {
    query: transactionQuery,
    variables: { transaction: signedTxBinary },
  });
}
