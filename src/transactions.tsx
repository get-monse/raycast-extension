import {Action, ActionPanel, Color, Detail, Icon, List} from "@raycast/api";
import {useFetch} from "@raycast/utils"
import {useState} from "react";
import {preferences} from "./utils/preferences";
import {format_currency} from "./utils/numbers";
import {Transaction} from "./utils/types";

export default function Command() {
    const [searchText, setSearchText] = useState("");
    const {isLoading, data: transactions} = useFetch(
        `https://monse.app/v1/transactions?page=1&include=category,bankAccount,bankAccount.bank&filter[text]=${searchText}&base-fiat=${preferences.currency}&per-page=30`,
        {
            headers: {Authorization: `Bearer ${preferences.token}`},
            keepPreviousData: true,
        }
    );

    return (
        <List isLoading={isLoading} searchText={searchText} onSearchTextChange={setSearchText} throttle>
            {(transactions === undefined ? [] : transactions.data).map((transaction: Transaction) => <List.Item
                key={transaction.id}
                title={transaction.concept.split('\n', 1)[0]}
                subtitle={transaction.notes || ''}
                accessories={[
                    {date: new Date(transaction.booked_at)},
                    {
                        text: format_currency(transaction.amount, preferences.currency),
                        icon: {
                            source: transaction.type === 'expense' ? Icon.ArrowUp : Icon.ArrowDown,
                            tintColor: transaction.type === 'expense' ? Color.Red : Color.Green
                        }
                    }
                ]}
                actions={getActions(transaction)} />)}
        </List>
    );
};

function getActions(transaction: Transaction) {
    return <ActionPanel>
        <Action.Push title="Show Details"
                     shortcut={{key: "enter", modifiers: []}}
                     target={<Detail
                         markdown={`## ${transaction.concept}
${transaction.notes || ''}`}
                         navigationTitle="Transaction details"
                         metadata={
                             <Detail.Metadata>
                                 <Detail.Metadata.Label title="Bank" text={transaction.bank_account.bank.name}
                                                        icon={transaction.bank_account.bank.logo} />
                                 <Detail.Metadata.Label title="Account" text={transaction.bank_account.name} />
                                 <Detail.Metadata.Label title="Booked at"
                                                        text={new Date(transaction.booked_at).toLocaleString()} />
                                 <Detail.Metadata.Label title="Quantity"
                                                        text={format_currency(transaction.amount, preferences.currency)} />
                                 <Detail.Metadata.TagList title="Category">
                                     <Detail.Metadata.TagList.Item text={transaction.category.name}
                                                                   color={transaction.type === 'expense' ? '#f43f5e' : '#14b8a6'} />
                                 </Detail.Metadata.TagList>
                             </Detail.Metadata>
                         }
                         actions={<ActionPanel>
                             <Action.OpenInBrowser title="Show in monse.app" url="https://monse.app/transactions"
                                                   shortcut={{key: "enter", modifiers: []}} />
                         </ActionPanel>}
                     />}
        />
        <Action.OpenInBrowser title="Show in monse.app" url="https://monse.app/transactions"
                              shortcut={{key: "enter", modifiers: ['cmd']}} />
    </ActionPanel>
}
