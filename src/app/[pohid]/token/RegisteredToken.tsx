import { PoHContract } from 'enums/PoHContract';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { useState } from 'react';
import Field from 'components/Field';
import Label from 'components/Label';
import { TOKEN_CHAIN } from 'config/chains';
import { CONTRACT } from 'contracts';
import {
  useGCTAllowance,
  useGCTApprove,
  useGCTBalanceOf,
  useGCTMint,
} from 'hooks/useGroupCurrencyToken';
import { useHubTokenToUser } from 'hooks/useHub';
import { usePoHRedeem } from 'hooks/usePoHTokenManager';
import { useTokenAllowance, useTokenApprove, useTokenBalanceOf } from 'hooks/useToken';
import useWeb3 from 'hooks/useWeb3';
import { formatEth } from 'utils/misc';

interface RegisteredTokenProps {
  pohName: string;
  circlesToken: string;
}

const RegisteredToken: React.FC<RegisteredTokenProps> = ({ pohName, circlesToken }) => {
  const { account } = useWeb3();

  const [circlesWallet] = useHubTokenToUser(circlesToken);

  const [myCirclesBalance, { mutate: mutateMyCirclesBalance }] = useTokenBalanceOf(
    circlesToken,
    account,
  );
  const [treasuryCirclesBalance, { mutate: mutateTreasuryCirlclesBalance }] = useTokenBalanceOf(
    circlesToken,
    CONTRACT[PoHContract.POH_TOKEN_MANAGER][TOKEN_CHAIN],
  );
  const [myPoHBalance, { mutate: mutateMyPoHBalance }] = useGCTBalanceOf(account);
  const [otherPoHBalance] = useGCTBalanceOf(circlesWallet);

  const [tokensToMint, setTokensToMint] = useState(0);
  const [tokensToRedeem, setTokensToRedeem] = useState(0);
  const [mintLoading, setMintLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);

  const gctContract = CONTRACT[PoHContract.GROUP_CURRENCY_TOKEN][TOKEN_CHAIN];
  const pohtmContract = CONTRACT[PoHContract.POH_TOKEN_MANAGER][TOKEN_CHAIN];

  const [crcAllowance, { mutate: mutateCRCAllowance }] = useTokenAllowance(
    circlesToken,
    account,
    gctContract,
  );
  const [gctAllowance, { mutate: mutateGCTAllowance }] = useGCTAllowance(account, pohtmContract);

  const mint = useGCTMint();
  const redeem = usePoHRedeem();
  const crcApprove = useTokenApprove(circlesToken);
  const gctApprove = useGCTApprove();

  const isSelf = !!account && account === circlesWallet;

  return (
    <div className="flex flex-col bg-emerald-50 p-4">
      <div className="bg-white p-6">
        <div className="flex flex-col">
          {otherPoHBalance && (
            <span className="font-bold">
              {isSelf ? 'You own ' : pohName + ' owns '}
              <code className="font-bold text-emerald-400">
                {formatEth(otherPoHBalance, 2)}
              </code>{' '}
              <code className="font-bold">POH</code> Tokens
            </span>
          )}

          {myCirclesBalance && (
            <>
              <Label>
                You have <code className="font-bold">{formatEth(myCirclesBalance, 2)}</code>{' '}
                {isSelf ? '' : 'of ' + pohName + "'s"} personal{' '}
                <code className="font-bold">CRC</code> you can use to mint{' '}
                <code className="font-bold">POH</code>.
              </Label>
              {!myCirclesBalance.isZero() && (
                <div className="mb-4 flex">
                  <Field
                    type="number"
                    className="no-spinner"
                    placeholder="Number of tokens"
                    min={0}
                    max={formatEther(myCirclesBalance)}
                    step={1}
                    value={tokensToMint}
                    onChange={(e) => setTokensToMint(parseFloat(e.target.value || '0'))}
                  />
                  {crcAllowance &&
                    (crcAllowance.gte(parseEther(tokensToMint.toString())) ? (
                      <button
                        className="btn-main ml-2 px-2 font-bold"
                        disabled={!tokensToMint}
                        onClick={async () => {
                          setMintLoading(true);
                          await mint(
                            circlesToken,
                            parseEther(tokensToMint.toString()),
                            {},
                            {
                              onSuccess: () => {
                                setMintLoading(false);
                                setTokensToMint(0);
                                mutateCRCAllowance();
                              },
                              onError: () => setMintLoading(false),
                            },
                          );
                        }}
                      >
                        {mintLoading ? '...' : 'MINT'}
                      </button>
                    ) : (
                      <button
                        className="btn-main ml-2 px-2 font-bold"
                        onClick={async () => {
                          setMintLoading(true);
                          await crcApprove(
                            gctContract,
                            parseEther(tokensToMint.toString()),
                            {},
                            {
                              onSuccess: () => {
                                setMintLoading(false);
                                mutateMyCirclesBalance();
                              },
                              onError: () => setMintLoading(false),
                            },
                          );
                        }}
                      >
                        {mintLoading ? '...' : 'APPROVE'}
                      </button>
                    ))}
                </div>
              )}
            </>
          )}

          {treasuryCirclesBalance && myPoHBalance && (
            <>
              <Label>
                There are <code className="font-bold">{formatEth(treasuryCirclesBalance, 2)}</code>{' '}
                of {isSelf ? 'your' : pohName + "'s"} personal{' '}
                <code className="font-bold">CRC</code> in the treasury.{' '}
                {!myPoHBalance.isZero() && (
                  <>
                    You can use some of your{' '}
                    <code className="font-bold">{formatEth(myPoHBalance, 2)} POH</code> to redeem
                    some.
                  </>
                )}
              </Label>
              {!myPoHBalance.isZero() && (
                <div className="mb-4 flex">
                  <Field
                    type="number"
                    className="no-spinner"
                    placeholder="Number of tokens"
                    value={tokensToRedeem}
                    min={0}
                    max={formatEther(myPoHBalance)}
                    step={1}
                    onChange={(e) => setTokensToRedeem(parseFloat(e.target.value))}
                  />

                  {gctAllowance &&
                    (gctAllowance.gte(parseEther(tokensToRedeem.toString())) ? (
                      <button
                        className="btn-main ml-2 px-2 font-bold"
                        disabled={!tokensToRedeem}
                        onClick={async () => {
                          setRedeemLoading(true);
                          await redeem(
                            circlesToken,
                            parseEther(tokensToRedeem.toString()),
                            {},
                            {
                              onSuccess: () => {
                                setRedeemLoading(false);
                                setTokensToRedeem(0);
                                mutateTreasuryCirlclesBalance();
                                mutateMyPoHBalance();
                              },
                              onError: () => setRedeemLoading(false),
                            },
                          );
                        }}
                      >
                        {redeemLoading ? '...' : 'REDEEM'}
                      </button>
                    ) : (
                      <button
                        className="btn-main ml-2 px-2 font-bold"
                        onClick={async () => {
                          setRedeemLoading(false);
                          await gctApprove(
                            pohtmContract,
                            parseEther(tokensToRedeem.toString()),
                            {},
                            {
                              onSuccess: () => {
                                setRedeemLoading(false);
                                mutateGCTAllowance();
                              },
                              onError: () => setRedeemLoading(false),
                            },
                          );
                        }}
                      >
                        {redeemLoading ? '...' : 'APPROVE'}
                      </button>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredToken;
