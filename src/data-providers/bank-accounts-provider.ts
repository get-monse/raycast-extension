import { BankAccount, Transaction } from "../utils/types";
import { useFetch } from "@raycast/utils";
import { showToast, Toast } from "@raycast/api";
import { preferences } from "../utils/preferences";

type BankAccountsResponse = {
  isLoading: boolean;
  bankAccounts: Array<BankAccount>;
  mutate: () => void;
};

const fetchBankAccounts = function (): BankAccountsResponse {
  const { isLoading, data, mutate } = useFetch<BankAccount[]>(`https://monse.app/v1/bank-accounts?include=bank`, {
    headers: { Authorization: `Bearer ${preferences.token}` },
    keepPreviousData: true,
    onError: async () => {
      await showToast({
        style: Toast.Style.Failure,
        title: "Request failed",
        message: "Check your token and expiration if still don't work",
      });
    },
  });

  let bankAccounts: Array<BankAccount> = data === undefined ? [] : data;
  bankAccounts = bankAccounts.filter((b) => !b.hidden);

  return { isLoading, bankAccounts, mutate };
};

export { fetchBankAccounts };
