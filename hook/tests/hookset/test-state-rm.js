require('../../utils-tests.js').TestRig('ws://localhost:6005').then(t=>
{
    const account =  t.randomAccount();
    t.fundFromGenesis(account).then(()=>
    {
        t.feeSubmit(account.seed,
        {
            Account: account.classicAddress,
            TransactionType: "SetHook",
            Hooks: [
                {
                    Hook: {
                        CreateCode: t.wasm('makestate.wasm'),
                        HookApiVersion: 0,
                        HookNamespace: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
                        HookOn: "0000000000000000"
                    }
                },
                {    Hook: {
                        CreateCode: t.wasm('checkstate.wasm'),
                        HookApiVersion: 0,
                        HookNamespace: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
                        HookOn: "0000000000000000"
                    }
                },
                {   Hook: {} },
                {   Hook: {} }
            ]
        }).then(x=>
        {
            t.assertTxnSuccess(x)
            t.api.submit(
            {
                Account: account.classicAddress,
                TransactionType: "AccountSet",  // trigger hooks
                Fee: "100000"
            }, {wallet: account}).then(x=>
            {
                t.assertTxnSuccess(x)
                console.log(x);

                t.feeSubmit(account.seed,
                {
                    Account: account.classicAddress,
                    TransactionType: "SetHook",
                    Hooks: [
                        {
                            Hook: {
                                CreateCode: t.wasm("rmstate.wasm"),
                                HookApiVersion: 0,
                                HookNamespace: "DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF",
                                HookOn: "0000000000000000",
                                Flags: t.hsfOVERRIDE
                            },
                        },
                        {
                            Hook: {
                                Flags: t.hsfOVERRIDE,
                                CreateCode: ""
                            }
                        }
                    ]
                }).then(x=>
                {
                    t.assertTxnSuccess(x)
                    t.api.submit(
                    {
                        Account: account.classicAddress,
                        TransactionType: "AccountSet",  // trigger hooks
                        Fee: "100000"
                    }, {wallet: account}).then(x=>
                    {
                        t.assertTxnSuccess(x);
                        process.exit(0);
                    });
                });
            }).catch(t.err);
        }).catch(t.err);
    }).catch(t.err);
})



