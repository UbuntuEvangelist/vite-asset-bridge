const EthBridge = artifacts.require("EthBridge");
const keccak256 = require('keccak256')
const RLP = artifacts.require("RLP");
const BytesLib = artifacts.require("BytesLib");
const { bufferToHex, bufferToInt, toBuffer } = require('ethereumjs-util')
const { Account, Header, Log, Proof, Receipt, Transaction } = require('eth-object');
const { assert } = require('chai');
const { encode, decode } = require('rlp');


function blockHeader(blockHex) {
    const blockHeader = Header.fromHex(blockHex);
    const headers = [
        blockHeader.parentHash,
        blockHeader.sha3Uncles,
        blockHeader.miner,
        blockHeader.stateRoot,
        blockHeader.transactionsRoot,
        blockHeader.receiptRoot,
        blockHeader.logsBloom,
        blockHeader.difficulty,
        blockHeader.number,
        blockHeader.gasLimit,
        blockHeader.gasUsed,
        blockHeader.timestamp,
        blockHeader.extraData,
        blockHeader.mixHash,
        blockHeader.nonce,
    ];
    return { hash: bufferToHex(keccak256(blockHeader.serialize())), headers: encode(headers), header: blockHeader }
}

const blockHexList = [
    "0xf90211a05dbc20ff76aeb219b08984b6373e4be230b50db0c784d3cd7fa792ca929c2a5ba01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347945a0b54d5dc17e0aadc383d2db43b0a0d3e029c4ca0946a698b5bd180d307a8fc5045998f381957a9e739a51f3ea010ce233ead16f6a02bbb882b75d225b550f4a925422854b2f25bb2d2a882ecbed6dd7f80b5c446c9a08a5249ef06503334c704b7606ef0f0306cb0d2474e069050a77a46c7cb52faedb90100b5a54ba0b056090c00151c1881145fa9ba10e2c835044084a083248881420b45430541200d701101dd4066409007d9178a4c2287792c26a0281480c8d83c814c4a02a2280ec0cf83f826998eb430f261129c9d0e08edb0042c3211929220a9911822c110a2d8110224b562011ba749b028821e78781c74004852b11c198240a0bfdbd49f8e244000b4c00aa5b088274b1c4e0ac119b0509c621004c0031841128af585893440ae028cc6ffa97940181a0776408280425b0048030264224b264051472982f0305682213256213b12f28d28e0562281e4201c41124f1311f1280010983067654eb518db01aea015a6af1a03903016c28c0040c0481d484a24094e870b951f9771780683a92be983bebc2083beb041845f8d9bdf906574682d70726f2d687a6f2d74303035a070a5dae1d9aa80afc8a8d8ab98825f48cb9d8db8194a6929f1b49b207d97f12c88972c9d98010783e2",
    "0xf9021aa04a419022aa83efd6332ac4a0a0b5be84591a025e73a33086fe918b03bc11de41a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d4934794ea674fdde714fd979de3edf0f56aa9716b898ec8a037377ae7f1fedeb1f4aa06f6daf0e833afd3bdb4025fc3d445a9f3d11d8210aaa00698c2e76b2b3f9442c5cf244287a9af3ba83d637e349463559385e8110cc3a9a0dcd12362e2593530aa278d1711065335e4ae693fa6d0865dbb6c6e1fcdf48c2db90100dcb849a185dca0d71220ae32b6227fe7435181408339305311a33bce01baf508b8d09c7163211cfa8e64d24c13061902439ac1d43d1407f1e48cc2a8d131b0680f0c1023af4d9d404a6a8068e681d3f896e8b181004409701290ab8f8092db1b589612d4371866e3af00e1829ba4ae936b8b66621d083e4c25b127dc9522546c32a8623700467007fa4c7ee4a9009d53c02a2e71c7cca01c6f25996e61136508df0d40390680270316048d9742127893f0427080b8031f2136e7841d2314800a200c255770dd4e11c101541614bc060d26006a9ee03e00d5f3898843129c6a498019e02b7205211182a2815bf974a1434476a135106b825c345b194c58f96355870b951f9775780683a92bea83be8c7283be824a845f8d9be99965746865726d696e652d65752d77657374332d312d67657468a0f178b9fd24959008b7b8d6ffe83d58c085a058d32068f879c0d6a1c109ba6dca88e62ca83004ca1c58",
    "0xf90214a0b0803297af749009223d19687c9539e55886839b2535a3d0fc71794945cc27b6a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d4934794b3b7874f13387d44a3398d298b075b7a3505d8d4a02576797d64ddfb8c3c8e7597fa90be78cc065fee8abbe8c3e7c9b56065c7fe30a0d9e81099b9db0e94d5d96775b19942eccd89c51fa7e6c276ddae0b6d174c4321a0737538606b7d4677b0a3be25ebd9cba1cf0a2636c8568ec2e082d04a50e9b27ab901008cea303351402e0004e0248181d155381539a140b71000f2bac1009f131c039036218512000b4042c11400563a5615140e28a106590220a0100072301028810d840a101c1241e41c4d248c08389052342604880048d4240011405a6c8257f00c1a2001b42fd8830aac03600486a92d2240029304778494650bc00cd746a94eea2d08dd8d42c021162f4188a489824b311c1c1a61c712300e21540162d0182e32029b61300c1e6060654433b219540876234385300b068c209833890b9200a83e10170f877d0091052c1610414a43740d0320b2433d8fa0132110a2b63265344a6c10a5030150512050b024aa100521704200d2aac6805a645262910488c3291e870b96923b6c66b583a92beb83bebc1483be9a0c845f8d9bf193424142454c504f4f4c2f48454c4c4f5f455448a050919b0d99c01f1f28c3e3c555cf25bacaa9dbc2c94baf2fc16cd8adf38cf43b88a6600f820a0c0619",
    "0xf9020da0c5d0a73abd37d969978349af9dc4b6594b1e2df94bd0022923f20fc7851d0765a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479452bc44d5378309ee2abf1539bf71de1b7d7be3b5a058c8240851bd8918f05913366484b8bf22a145ae33a22a6c3a821804022e979ea0db509fd575787808cf766d0965d631c647322260666914b087d6c92f5d8ac592a017bbfd99be4b6564bd35525191070db3eb1a571aabecc79bfb6a49987a2422d5b90100d87842886286e7420282ef428021598192050690340ac4dca48340f05861759406124e503a112f01e0400027323415f44aa0388259c003d03244cfc89e3a023700c29602834be21848f29a0d15e060721d216a420342e20a0164b350c2747a1a1ac0c3210648ed2087105bb431dcdc23c2c220e09ca8141c1441113149e4b4ec0946cd2ca309b4a2c8422288050b300004884921c506001aa0940842cd946944cb0a646e8704756e25caae8307a03040284f0e8a8113a90f4403a60028ca08552e2805a3a008e8c00c3c2c12034008272c408e07108e001400330bba001c2068073824352b14f014800116ca1db029b004664233d24b83c1a65a134494e12564870b98050db7d44183a92bec83beebc283beaf5c845f8d9bf38c6e616e6f706f6f6c2e6f7267a0614c0c30399cb82a5698c2bd9505ae0caad66aadb2874647a4d55305cf2b5b9f883be33565c60f65af",
    "0xf9020fa07dbcd1797e5ae22b560d9716421f5e04857d2c0e89f614f67b3c729a3cc16dd7a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479498474e755c0fe94f6b396ef90236898538146490a0016527dbd5471d73102bb609ef84650046148b62e8686caec777a9472e5d078ea056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000870b951f0c78664d83a92bed83bebc0980845f8d9c13915b50504c4e535d576f6f6c79506f6f6c79a05b98d6a187f104342e33683b9bde6d58c9e64f282847536d384bdbc41a02c31888de4c6ac6724f27e4",
    "0xf9020da0f43b9ef68c8e2438f0d59685cc4b191fda865f5a5d61a85c069145d3f7527f85a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479452bc44d5378309ee2abf1539bf71de1b7d7be3b5a0b3098b81c5c334d356c61d6479019f59372d16096f0b196a97cec80a5d99ba86a0b8d8dad6bdf734f7ce4be57791d1b77255859a364eb3527894eae84cc11666d7a00cdc140992578a3d2c9c62e998b86889a47bbb507616754c4df6f77cb60ece48b901001e6fc06cb38aa9048087664096e605b852c94a9c8f0c1f0e584135c9e5ea2164fb1c404704230c795261ca460ab8d3810adb02d64b0702b7e380df0e437c0b0d9654618fa10d4eed5ee0808e33327860c78e784581ccdcc5814e225280799cdf5e9a8a46ff324388951ae1480bcbb87c7b0828a0cd0a2c350492aa7b115a13261eb587ff9a25e402d2f62426bb890dc319a6d9e96568b029610e89f5e3392a188a33ca999d1c78432d696783001580596b8e02b9e9af2a401e664e79eacc481c50308d43603c858311771e1cd1f3b6de64a42b16138c68b29836c78303c0e0c954586cf59876881e7cc0442a3a13ecd6cf59b0216bfbc154a40df10a20c67ab0870b9691b05df55983a92bee83beebb783bed935845f8d9c148c6e616e6f706f6f6c2e6f7267a074ab1ba97a9379c8140f8829d29eac49aac86c4cd862897cc64532f91657b14188a6eb6000010bb206",
    "0xf9020ca0cbe7bbe632e437e267839d549bbea898dc86db0d4f6358e0bae55b29137b3262a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d4934794d224ca0c819e8e97ba0136b3b95ceff503b79f53a0cb2d87483626f3baf1df9677d7cab8d8a5998937679aac6ae96072c21beef579a017ae7662609e7e595050f869c391d086c95fd5b618aa0fb5c61ebd14d0971969a028b031fa13926310cfe49042d10af070234abd5ee034677bb17362889c883b78b9010098334aebc92e00901becadf0c2e556c8b24ba0b7be06b09cacf9360a7af3c16f181c525a237fdc59d13152430317d5825e08f93c19192bb1f3d61226592dbc104ec0789eb689f7994898a98ae770dd6f4e24f68668d6481788447b4883e4891255948d2927c6c498c189415eb3846e1a663b723494087f08ec8201b544a2d0040a63f1c1606584b20ae94aa32a48b7021170a86da304b04c13059c63051308560a481b6dfbb8be024530d6dd5100b8aa5bccb6cc296be8090a67a6006550609630a81542886ec9460b09569cc2eae22432808e171b9c281001db3807187af01ed43c307ec9da1921d29ccf242459b9a02575087b5aab53d7c89039342ba298b9870b98048298011783a92bef83bebbfe83be8949845f8d9c1a8b7575706f6f6c2e636e2d32a06548ad57fdc91f5a619d16057849457ee87cb77779a304f9ef88c7a74becd10b889a00235d2adac592",
    "0xf90211a090d9e0aea771bbcd26daf9b4cf3160dc4ee3e67cf69448e023a7a3e3e1fec9f1a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347945a0b54d5dc17e0aadc383d2db43b0a0d3e029c4ca0ea700b369d82be1d52f5058f0ea91738c61d1c3fc33851fecb6c714758973c6ba0b16124974f3e6f73618b573a9fff8cdbcd1125b692307802f8a9ed3653cb4309a07a3fc8f58ef6990fefbaf246c0362c4ff83d5e3234bb497dfc19b83cd572083ab901001bec4a4c5e82a388202d86d28487586104a600b402d8e5580485a14000e90519283c601122180423cc3a70011686c16983002832e8ff11c0a0a95a0400243c495681f625e6c28104e9dfb20ec7e0496614382c9821c08005674d474a81761b0c510a1d6b4f58c20186a5d410a1b16c6564e420f435581d3dbc209475523e508a3d21e02f1a2f204269ca44c4003210210208b59141802008620ca84304164d0822e358023b007b8a26e8049051356118660212b014405c62423b234811a2e0771500b55b8438a0108514644c427311dee54d3a3300bd003e08b9e7837106200e001c2891092a8d075cc904308ad226062b0584121028dc50241cd3241eaa7cb2870b9977832c541783a92bf083bed3c483be8e51845f8d9c1b906574682d70726f2d687a6f2d74303035a0e7681387256196e8f26855b4945d919fc0ec1cf6d09e06c917614eaefd4ccd168894ba311001a794ab",
    "0xf90211a0c0371721406d45c72441a02a99cc2bb50574b464879674aab9ed573dfbab103da01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479406b8c5883ec71bc3f4b332081519f23834c8706ea00e97ac60299fe9fef3e1fe9a25f4f8bf476e31d85893c8ba3364c5d09ee88d53a05c94596cbf21972bc02c615516d6619e9c05977730945002aef0e9aed5bccef5a04e2455da01be60d2542115b679cde000bc1c92d96106d27d1e5553df5d5ffc73b9010016794918c01464414120a500d06350a0a0a1015691000c1a1d937c8344da255500a388422c562514f2180860d00f35141aea75a20a2f00e550588ec0b065c888f24802691e0319085c62162830c106f01a04c83310e1c0967d0e102883f45ee859d788061e20c0204824c09098f3ec70442760000d3c0f0e204414791985d4d7141142111029451300c326c53e860e4801380c89456092492150815040711e10fa3300020dde7be64d03c7d928642310637e1283edea02430687007ac38a5001148c4392a9060100c4940208007b085cac309b12b704203c71901312461aaa492598fc21526404b4e8808c0601516f02c94d204391cd2d40a00017901c73b06e870b99778330541783a92bf183bea41183be6638845f8d9c29904d696e696e672045787072657373204da05bc890206bc080bd733033d65b524a6b62df6d608b19db305927b9ddf52c3d5a88720acc8ff82e6a16",
    "0xf90219a049275d6f96bb0ddfddf56e8dd7b5fd3faa06d7ee695ca5ee6661d7acf0c9c491a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479400192fb10df37c9fb26829eb2cc623cd1bf599e8a0a9bf69f4fee216cf128c4d916b2821cb1d6e786fc75873ba474665c6365dded2a055e30b8ecc860154415bd30bcde749018920b558c12554efc03fa085de848042a057c04b626e136850e2f066c4898b10555906a4ccd33851aebea1cfebd45f0493b901000c7107020642501512a576229b85310ba8d721005c081024869104211a28294520c813184d940d904411322a18a4a5116a0b2090091008802124c2485a65dc2940c80a40c921eca14c4e89483491f4f44814b044c04632028253ac629158b2191c85128d0f0cf2804711404208e8faa04240311394384c8a0a2985b000a016010e34da4700700006044250a4010d1082182989552d42804e6a2880c260915145832bc1021108222414004ad080112030604634902d235500406512049928141804004902810184020030146e00a20d36ea601393523c423269132413114128200074282b1a70b025128016a00030228ca56003bdc84884f124111d0c0050500a870b9aeab224ba2183a92bf283be746983be611c845f8d9c2e98457468657265756d50504c4e532f326d696e6572735f4555a09dfe36bd9bd947c6ecb0e59ea60b482bd7e708dd2c3376cb7491487bb3a2e704880482d0f66d547c98",
]

contract('Eth bridge', ([owner, alice]) => {
    beforeEach(async () => {
        const rlp = await RLP.new();
        const bytesLib = await BytesLib.new();
        await EthBridge.link('RLP', rlp.address);
        await EthBridge.link('BytesLib', bytesLib.address);
    });

    it('submit header', async function () {
        const blockHexList = [
            "0xf90211a05dbc20ff76aeb219b08984b6373e4be230b50db0c784d3cd7fa792ca929c2a5ba01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347945a0b54d5dc17e0aadc383d2db43b0a0d3e029c4ca0946a698b5bd180d307a8fc5045998f381957a9e739a51f3ea010ce233ead16f6a02bbb882b75d225b550f4a925422854b2f25bb2d2a882ecbed6dd7f80b5c446c9a08a5249ef06503334c704b7606ef0f0306cb0d2474e069050a77a46c7cb52faedb90100b5a54ba0b056090c00151c1881145fa9ba10e2c835044084a083248881420b45430541200d701101dd4066409007d9178a4c2287792c26a0281480c8d83c814c4a02a2280ec0cf83f826998eb430f261129c9d0e08edb0042c3211929220a9911822c110a2d8110224b562011ba749b028821e78781c74004852b11c198240a0bfdbd49f8e244000b4c00aa5b088274b1c4e0ac119b0509c621004c0031841128af585893440ae028cc6ffa97940181a0776408280425b0048030264224b264051472982f0305682213256213b12f28d28e0562281e4201c41124f1311f1280010983067654eb518db01aea015a6af1a03903016c28c0040c0481d484a24094e870b951f9771780683a92be983bebc2083beb041845f8d9bdf906574682d70726f2d687a6f2d74303035a070a5dae1d9aa80afc8a8d8ab98825f48cb9d8db8194a6929f1b49b207d97f12c88972c9d98010783e2",
            "0xf9021aa04a419022aa83efd6332ac4a0a0b5be84591a025e73a33086fe918b03bc11de41a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d4934794ea674fdde714fd979de3edf0f56aa9716b898ec8a037377ae7f1fedeb1f4aa06f6daf0e833afd3bdb4025fc3d445a9f3d11d8210aaa00698c2e76b2b3f9442c5cf244287a9af3ba83d637e349463559385e8110cc3a9a0dcd12362e2593530aa278d1711065335e4ae693fa6d0865dbb6c6e1fcdf48c2db90100dcb849a185dca0d71220ae32b6227fe7435181408339305311a33bce01baf508b8d09c7163211cfa8e64d24c13061902439ac1d43d1407f1e48cc2a8d131b0680f0c1023af4d9d404a6a8068e681d3f896e8b181004409701290ab8f8092db1b589612d4371866e3af00e1829ba4ae936b8b66621d083e4c25b127dc9522546c32a8623700467007fa4c7ee4a9009d53c02a2e71c7cca01c6f25996e61136508df0d40390680270316048d9742127893f0427080b8031f2136e7841d2314800a200c255770dd4e11c101541614bc060d26006a9ee03e00d5f3898843129c6a498019e02b7205211182a2815bf974a1434476a135106b825c345b194c58f96355870b951f9775780683a92bea83be8c7283be824a845f8d9be99965746865726d696e652d65752d77657374332d312d67657468a0f178b9fd24959008b7b8d6ffe83d58c085a058d32068f879c0d6a1c109ba6dca88e62ca83004ca1c58",
            "0xf90214a0b0803297af749009223d19687c9539e55886839b2535a3d0fc71794945cc27b6a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d4934794b3b7874f13387d44a3398d298b075b7a3505d8d4a02576797d64ddfb8c3c8e7597fa90be78cc065fee8abbe8c3e7c9b56065c7fe30a0d9e81099b9db0e94d5d96775b19942eccd89c51fa7e6c276ddae0b6d174c4321a0737538606b7d4677b0a3be25ebd9cba1cf0a2636c8568ec2e082d04a50e9b27ab901008cea303351402e0004e0248181d155381539a140b71000f2bac1009f131c039036218512000b4042c11400563a5615140e28a106590220a0100072301028810d840a101c1241e41c4d248c08389052342604880048d4240011405a6c8257f00c1a2001b42fd8830aac03600486a92d2240029304778494650bc00cd746a94eea2d08dd8d42c021162f4188a489824b311c1c1a61c712300e21540162d0182e32029b61300c1e6060654433b219540876234385300b068c209833890b9200a83e10170f877d0091052c1610414a43740d0320b2433d8fa0132110a2b63265344a6c10a5030150512050b024aa100521704200d2aac6805a645262910488c3291e870b96923b6c66b583a92beb83bebc1483be9a0c845f8d9bf193424142454c504f4f4c2f48454c4c4f5f455448a050919b0d99c01f1f28c3e3c555cf25bacaa9dbc2c94baf2fc16cd8adf38cf43b88a6600f820a0c0619",
            "0xf9020da0c5d0a73abd37d969978349af9dc4b6594b1e2df94bd0022923f20fc7851d0765a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479452bc44d5378309ee2abf1539bf71de1b7d7be3b5a058c8240851bd8918f05913366484b8bf22a145ae33a22a6c3a821804022e979ea0db509fd575787808cf766d0965d631c647322260666914b087d6c92f5d8ac592a017bbfd99be4b6564bd35525191070db3eb1a571aabecc79bfb6a49987a2422d5b90100d87842886286e7420282ef428021598192050690340ac4dca48340f05861759406124e503a112f01e0400027323415f44aa0388259c003d03244cfc89e3a023700c29602834be21848f29a0d15e060721d216a420342e20a0164b350c2747a1a1ac0c3210648ed2087105bb431dcdc23c2c220e09ca8141c1441113149e4b4ec0946cd2ca309b4a2c8422288050b300004884921c506001aa0940842cd946944cb0a646e8704756e25caae8307a03040284f0e8a8113a90f4403a60028ca08552e2805a3a008e8c00c3c2c12034008272c408e07108e001400330bba001c2068073824352b14f014800116ca1db029b004664233d24b83c1a65a134494e12564870b98050db7d44183a92bec83beebc283beaf5c845f8d9bf38c6e616e6f706f6f6c2e6f7267a0614c0c30399cb82a5698c2bd9505ae0caad66aadb2874647a4d55305cf2b5b9f883be33565c60f65af",
            "0xf9020fa07dbcd1797e5ae22b560d9716421f5e04857d2c0e89f614f67b3c729a3cc16dd7a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479498474e755c0fe94f6b396ef90236898538146490a0016527dbd5471d73102bb609ef84650046148b62e8686caec777a9472e5d078ea056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421b9010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000870b951f0c78664d83a92bed83bebc0980845f8d9c13915b50504c4e535d576f6f6c79506f6f6c79a05b98d6a187f104342e33683b9bde6d58c9e64f282847536d384bdbc41a02c31888de4c6ac6724f27e4",
            "0xf9020da0f43b9ef68c8e2438f0d59685cc4b191fda865f5a5d61a85c069145d3f7527f85a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479452bc44d5378309ee2abf1539bf71de1b7d7be3b5a0b3098b81c5c334d356c61d6479019f59372d16096f0b196a97cec80a5d99ba86a0b8d8dad6bdf734f7ce4be57791d1b77255859a364eb3527894eae84cc11666d7a00cdc140992578a3d2c9c62e998b86889a47bbb507616754c4df6f77cb60ece48b901001e6fc06cb38aa9048087664096e605b852c94a9c8f0c1f0e584135c9e5ea2164fb1c404704230c795261ca460ab8d3810adb02d64b0702b7e380df0e437c0b0d9654618fa10d4eed5ee0808e33327860c78e784581ccdcc5814e225280799cdf5e9a8a46ff324388951ae1480bcbb87c7b0828a0cd0a2c350492aa7b115a13261eb587ff9a25e402d2f62426bb890dc319a6d9e96568b029610e89f5e3392a188a33ca999d1c78432d696783001580596b8e02b9e9af2a401e664e79eacc481c50308d43603c858311771e1cd1f3b6de64a42b16138c68b29836c78303c0e0c954586cf59876881e7cc0442a3a13ecd6cf59b0216bfbc154a40df10a20c67ab0870b9691b05df55983a92bee83beebb783bed935845f8d9c148c6e616e6f706f6f6c2e6f7267a074ab1ba97a9379c8140f8829d29eac49aac86c4cd862897cc64532f91657b14188a6eb6000010bb206",
            "0xf9020ca0cbe7bbe632e437e267839d549bbea898dc86db0d4f6358e0bae55b29137b3262a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d4934794d224ca0c819e8e97ba0136b3b95ceff503b79f53a0cb2d87483626f3baf1df9677d7cab8d8a5998937679aac6ae96072c21beef579a017ae7662609e7e595050f869c391d086c95fd5b618aa0fb5c61ebd14d0971969a028b031fa13926310cfe49042d10af070234abd5ee034677bb17362889c883b78b9010098334aebc92e00901becadf0c2e556c8b24ba0b7be06b09cacf9360a7af3c16f181c525a237fdc59d13152430317d5825e08f93c19192bb1f3d61226592dbc104ec0789eb689f7994898a98ae770dd6f4e24f68668d6481788447b4883e4891255948d2927c6c498c189415eb3846e1a663b723494087f08ec8201b544a2d0040a63f1c1606584b20ae94aa32a48b7021170a86da304b04c13059c63051308560a481b6dfbb8be024530d6dd5100b8aa5bccb6cc296be8090a67a6006550609630a81542886ec9460b09569cc2eae22432808e171b9c281001db3807187af01ed43c307ec9da1921d29ccf242459b9a02575087b5aab53d7c89039342ba298b9870b98048298011783a92bef83bebbfe83be8949845f8d9c1a8b7575706f6f6c2e636e2d32a06548ad57fdc91f5a619d16057849457ee87cb77779a304f9ef88c7a74becd10b889a00235d2adac592",
            "0xf90211a090d9e0aea771bbcd26daf9b4cf3160dc4ee3e67cf69448e023a7a3e3e1fec9f1a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347945a0b54d5dc17e0aadc383d2db43b0a0d3e029c4ca0ea700b369d82be1d52f5058f0ea91738c61d1c3fc33851fecb6c714758973c6ba0b16124974f3e6f73618b573a9fff8cdbcd1125b692307802f8a9ed3653cb4309a07a3fc8f58ef6990fefbaf246c0362c4ff83d5e3234bb497dfc19b83cd572083ab901001bec4a4c5e82a388202d86d28487586104a600b402d8e5580485a14000e90519283c601122180423cc3a70011686c16983002832e8ff11c0a0a95a0400243c495681f625e6c28104e9dfb20ec7e0496614382c9821c08005674d474a81761b0c510a1d6b4f58c20186a5d410a1b16c6564e420f435581d3dbc209475523e508a3d21e02f1a2f204269ca44c4003210210208b59141802008620ca84304164d0822e358023b007b8a26e8049051356118660212b014405c62423b234811a2e0771500b55b8438a0108514644c427311dee54d3a3300bd003e08b9e7837106200e001c2891092a8d075cc904308ad226062b0584121028dc50241cd3241eaa7cb2870b9977832c541783a92bf083bed3c483be8e51845f8d9c1b906574682d70726f2d687a6f2d74303035a0e7681387256196e8f26855b4945d919fc0ec1cf6d09e06c917614eaefd4ccd168894ba311001a794ab",
            "0xf90211a0c0371721406d45c72441a02a99cc2bb50574b464879674aab9ed573dfbab103da01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479406b8c5883ec71bc3f4b332081519f23834c8706ea00e97ac60299fe9fef3e1fe9a25f4f8bf476e31d85893c8ba3364c5d09ee88d53a05c94596cbf21972bc02c615516d6619e9c05977730945002aef0e9aed5bccef5a04e2455da01be60d2542115b679cde000bc1c92d96106d27d1e5553df5d5ffc73b9010016794918c01464414120a500d06350a0a0a1015691000c1a1d937c8344da255500a388422c562514f2180860d00f35141aea75a20a2f00e550588ec0b065c888f24802691e0319085c62162830c106f01a04c83310e1c0967d0e102883f45ee859d788061e20c0204824c09098f3ec70442760000d3c0f0e204414791985d4d7141142111029451300c326c53e860e4801380c89456092492150815040711e10fa3300020dde7be64d03c7d928642310637e1283edea02430687007ac38a5001148c4392a9060100c4940208007b085cac309b12b704203c71901312461aaa492598fc21526404b4e8808c0601516f02c94d204391cd2d40a00017901c73b06e870b99778330541783a92bf183bea41183be6638845f8d9c29904d696e696e672045787072657373204da05bc890206bc080bd733033d65b524a6b62df6d608b19db305927b9ddf52c3d5a88720acc8ff82e6a16",
            "0xf90219a049275d6f96bb0ddfddf56e8dd7b5fd3faa06d7ee695ca5ee6661d7acf0c9c491a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d493479400192fb10df37c9fb26829eb2cc623cd1bf599e8a0a9bf69f4fee216cf128c4d916b2821cb1d6e786fc75873ba474665c6365dded2a055e30b8ecc860154415bd30bcde749018920b558c12554efc03fa085de848042a057c04b626e136850e2f066c4898b10555906a4ccd33851aebea1cfebd45f0493b901000c7107020642501512a576229b85310ba8d721005c081024869104211a28294520c813184d940d904411322a18a4a5116a0b2090091008802124c2485a65dc2940c80a40c921eca14c4e89483491f4f44814b044c04632028253ac629158b2191c85128d0f0cf2804711404208e8faa04240311394384c8a0a2985b000a016010e34da4700700006044250a4010d1082182989552d42804e6a2880c260915145832bc1021108222414004ad080112030604634902d235500406512049928141804004902810184020030146e00a20d36ea601393523c423269132413114128200074282b1a70b025128016a00030228ca56003bdc84884f124111d0c0050500a870b9aeab224ba2183a92bf283be746983be611c845f8d9c2e98457468657265756d50504c4e532f326d696e6572735f4555a09dfe36bd9bd947c6ecb0e59ea60b482bd7e708dd2c3376cb7491487bb3a2e704880482d0f66d547c98",
        ]
        blockHexList.forEach(block => {
            const { hash, headers, header } = blockHeader(block);
            console.log(bufferToInt(header.number), hash);
        });

        {
            const { hash, headers, header } = blockHeader(blockHexList[0]);

            this.bridge = await EthBridge.new();
            console.log("init args", bufferToHex(hash), bufferToHex(headers));
            await this.bridge.init(0, 0, 0, hash, headers);

            const leastDifficulty = await this.bridge.leastDifficulty();
            assert.equal(leastDifficulty, 0);
            const { 0: height, 1: headerHash, 2: parentHash } = await this.bridge.latest();
            assert.equal(headerHash, hash);
            console.log(height.toString(), headerHash, parentHash);

            {
                const { 0: height, 1: headerHash, 2: parentHash } = await this.bridge.history(bufferToInt(header.number));
                console.log(height.toString(), headerHash, parentHash);
            }
        }
        {
            const { hash, headers, header } = blockHeader(blockHexList[1]);
            console.log(bufferToInt(header.number), bufferToHex(header.parentHash), bufferToHex(hash));
            console.log("submit args", bufferToHex(hash), bufferToHex(headers));
            await this.bridge.submitHeader(hash, headers);

            const { 0: height, 1: headerHash, 2: parentHash } = await this.bridge.latest();
            assert.equal(headerHash, hash);
            console.log(height.toString(), headerHash, parentHash);
        }

        {
            const { hash, headers } = blockHeader(blockHexList[2]);
            console.log("submit args", bufferToHex(hash), bufferToHex(headers));
            await this.bridge.submitHeader(hash, headers);

            const { 0: height, 1: headerHash, 2: parentHash } = await this.bridge.latest();
            assert.equal(headerHash, hash);
            console.log(height.toString(), headerHash, parentHash);
        }
        {
            const { 0: height, 1: headerHash, 2: parentHash } = await this.bridge.history(11086825);
            console.log(height.toString(), headerHash, parentHash);
        }
        {
            const { 0: height, 1: headerHash, 2: parentHash } = await this.bridge.history(11086826);
            console.log(height.toString(), headerHash, parentHash);
        }
        {
            const { 0: height, 1: headerHash, 2: parentHash } = await this.bridge.history(11086827);
            console.log(height.toString(), headerHash, parentHash);
        }


        // -----------


        const logs = [
            toBuffer('0xf89b94021576770cb3729716ccfb687afdb4c6bf720cb6f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dca0000000000000000000000000e3e15b09e1a8cb96032690448a18173b170a8d5ca0000000000000000000000000000000000000000000000001962cde83c99ac832'),
            toBuffer('0xf89b94021576770cb3729716ccfb687afdb4c6bf720cb6f863a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dca00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0fffffffffffffffffffffffffffffffffffffffffffffffa4fbcd49f75a5945a'),
            toBuffer('0xf89b94c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000e3e15b09e1a8cb96032690448a18173b170a8d5ca0000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dca000000000000000000000000000000000000000000000000003bc43ef4c08a8e6'),
            toBuffer('0xf87994e3e15b09e1a8cb96032690448a18173b170a8d5ce1a01c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1b84000000000000000000000000000000000000000000000017bf9d63930dacb54b00000000000000000000000000000000000000000000000037d876b38ca168e53'),
            toBuffer('0xf8fc94e3e15b09e1a8cb96032690448a18173b170a8d5cf863a0d78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822a00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dcb880000000000000000000000000000000000000000000000001962cde83c99ac8320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003bc43ef4c08a8e6'),
            toBuffer('0xf89b94a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dca0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dca000000000000000000000000000000000000000000000000000000000061437ac'),
            toBuffer('0xf87994b4e16d0168e52d35cacd2c6185b44281ec28c9dce1a01c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1b84000000000000000000000000000000000000000000000000000010c295dbacc7300000000000000000000000000000000000000000000a44929ecfbcd22a6264b'),
            toBuffer('0xf8fc94b4e16d0168e52d35cacd2c6185b44281ec28c9dcf863a0d78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822a00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dcb880000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003bc43ef4c08a8e600000000000000000000000000000000000000000000000000000000061437ac0000000000000000000000000000000000000000000000000000000000000000'),
        ]
        const status = toBuffer('0x01');
        const gas = toBuffer('0xaa0943');
        const logsBloom = toBuffer('0x10204000000000000004000080000000000000000000000000010000000000000000000000000000000000000000000202000000080000000000000000280000000000000000000008000008000002600000000000040000000000000000000000000000200000000000000000004000000000000000000000000010000000000000000000000000004000000000000800000000010000080000004000000000020000000000200200000000000010000000000000000000000000000000000040000802000000000000002000000000000000000000001000000000000020000018200000000000000000000000000000000000000000000000000000000000');

        // const value = toBuffer('0xf9043a01830196aab9010000200000000000000000000080000000000000000000000000000000000000000000000000000000000000001004000002000000080000000000000000000000000000000000000000000008000000200000000000400000000000000000000000000000000000000000000000000000000000000000040000000010000200000000400000000000000000000000040000080000000000082000004000000000000000000000000000400000000000000000000000000000000100000000000000000102000000000000000000000000000000020000001000000002000000000000200000000000000000000000000000000000000000000000010000000000f9032ff89b947a9277aa08a633766461351ec00996a0cbe905adf863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000003e1804fa401d96c48bed5a9de10b6a5c99a53965a0000000000000000000000000e1ee482eefd3fc379b7154399f8d52956fb3c520a0000000000000000000000000000000000000000000000008252610ddca3f2a7cf89b94c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000e1ee482eefd3fc379b7154399f8d52956fb3c520a00000000000000000000000003e1804fa401d96c48bed5a9de10b6a5c99a53965a00000000000000000000000000000000000000000000000006dd1d3e675d12ca8f87994e1ee482eefd3fc379b7154399f8d52956fb3c520e1a01c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1b84000000000000000000000000000000000000000000000008137f863472c77294900000000000000000000000000000000000000000000000665553354489d7a49f8fc94e1ee482eefd3fc379b7154399f8d52956fb3c520f863a0d78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822a00000000000000000000000003e1804fa401d96c48bed5a9de10b6a5c99a53965a00000000000000000000000003e1804fa401d96c48bed5a9de10b6a5c99a53965b880000000000000000000000000000000000000000000000008252610ddca3f2a7c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006dd1d3e675d12ca8f87a94c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2f842a07fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65a00000000000000000000000003e1804fa401d96c48bed5a9de10b6a5c99a53965a00000000000000000000000000000000000000000000000006dd1d3e675d12ca9');
        const encodedPath = encode(202);
        const proofs = toBuffer('0xf90b16b90134f90131a0da224d56bce5841673a059da3d3625b5d14b3d95e1333253df4853d4de332e84a099c693c82f2c8883be479ef1f729d3fe3bb865f5f81d3239f810b047cd1aac0ea031e20b5e3ff892f350e1b0769ab0957ac295f9000d2170c9b86c1dfde38067d4a07378e0c3c8a819f6c7fde2e6a39d2c304088d2465cdb192c3766d5d8073432d8a00363d020fd44a89dabf2c1663117dde76f88c842e03de3daacece3ec9b79e63aa0a33dbe0b21cca068091b3443dd16f895fbb8c12b44891c8a51054e45ff3bf39da0d71863db1af1486822e0c6700c0ea8c912853b9eed6d90d078a788ca0118370fa0a3da2ffc13ffec1a9aa3891f72db9a430fa6470308e011583c67a339ec77c9bea0895072c8b994ad86b685735475dd335b06bdeaf7f6c7398bdebf09686314ee078080808080808080b853f851a0a55653bbffc1067439bfb89d05461769df318adb2185f30f91daf45126b9f494a060e55c1901f62e70f3f5bc6de8e57c4f41b097819fb7ec3303ade67513d4580e808080808080808080808080808080b8f3f8f18080808080808080a010cfa7e22390867ee4f26da6f25015c9414792254586e691815cedbbf577aaf7a0f1e1fb8fa10c2159e9223a38a24e052ae57cac8ec037ec8d3a20f16f178a6023a0b27bdd11afc091ad40aa7957644d7f1e5c8f9a96676ff3dedc64aa0c97182aeca0b0d8e125e12e8570889471702bcf7051fabe9a2d8f7e7f7d0549269ebad01f4ca01626007d2353c6ccf3426468d1bc52f396e7364f928bc8cd7a6893de9d5bb01ba006cc8640fcfb553788f1f0bd3aec0f165c6d4138af421586add017e4acff96dda0792448deb180ce9ba0900b50812ddce0daae9a829a7a580532fb63736c9d2cbf8080b90214f90211a0a44a67d5ff87c03f633e3aac61cd4b8a4b624bfccdeea56b57b6909ed25e62c1a089bc59201eae47153b33f62586f10252de177dccd4564948e3fbcf50ec1574ada049ed0b3e5cbf578115c0dc3a66b12d4382f2cf8aa20ecafb34a5a688a2fcb138a09dc4769b53d45287ddf8629b68f9c09347d6efa261e6bcd2022ea9ae7eb8d0e3a0451b664bee5372f866585f2e8c514159b9eb0bf2d8434b41560404d3aa28f463a025067272615e2557f3ba884946aa80e9c0ca23c0d0f1236624ae7b3f2d7fe421a0d4e653d7e75959d2eb32ca0a6f3caf76bba465b64e87529af325224284401cd0a07d685915f903eb6593155a9d63f89e2bbbfed5376510c8ef13931d3dad4cca8fa091970fdf843fd9bc8e357d08cbda05743bb854f4b0aafa20afac045d6f62a0a4a0c29bdb1d6825cb720fe7333851a63527496673b4aae7823a2e96366ebb62a7baa0ea7cd42f8b7660e5d2685251e6a86c072041234f86086db40c1d10fb839ffd8fa01ca000a11b4f9f324665e9ad6d58ceac43b2800b1a359370727ded254ee60c04a076b7d0f27427b4f6f71f6115c09368ec20bbc0239d5a18dd2cf5aec7d77f5bf0a063c482ac3446f9a579fd4f8ace5978b31cf3d09a9a04b6038b10066dc506de7ca029fdb28c55e40a74d4918274d684f6fe3db7666d6803499863b1c70098535f21a0478693adc33d27b33ddd223bd950b7d70bee0ab67a8fe4dc3996b7d9a5d99e8780b9067bf9067820b90674f906710183aa0943b9010010204000000000000004000080000000000000000000000000010000000000000000000000000000000000000000000202000000080000000000000000280000000000000000000008000008000002600000000000040000000000000000000000000000200000000000000000004000000000000000000000000010000000000000000000000000004000000000000800000000010000080000004000000000020000000000200200000000000010000000000000000000000000000000000040000802000000000000002000000000000000000000001000000000000020000018200000000000000000000000000000000000000000000000000000000000f90566f89b94021576770cb3729716ccfb687afdb4c6bf720cb6f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dca0000000000000000000000000e3e15b09e1a8cb96032690448a18173b170a8d5ca0000000000000000000000000000000000000000000000001962cde83c99ac832f89b94021576770cb3729716ccfb687afdb4c6bf720cb6f863a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dca00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0fffffffffffffffffffffffffffffffffffffffffffffffa4fbcd49f75a5945af89b94c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000e3e15b09e1a8cb96032690448a18173b170a8d5ca0000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dca000000000000000000000000000000000000000000000000003bc43ef4c08a8e6f87994e3e15b09e1a8cb96032690448a18173b170a8d5ce1a01c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1b84000000000000000000000000000000000000000000000017bf9d63930dacb54b00000000000000000000000000000000000000000000000037d876b38ca168e53f8fc94e3e15b09e1a8cb96032690448a18173b170a8d5cf863a0d78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822a00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dcb880000000000000000000000000000000000000000000000001962cde83c99ac8320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003bc43ef4c08a8e6f89b94a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48f863a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa0000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dca0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dca000000000000000000000000000000000000000000000000000000000061437acf87994b4e16d0168e52d35cacd2c6185b44281ec28c9dce1a01c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1b84000000000000000000000000000000000000000000000000000010c295dbacc7300000000000000000000000000000000000000000000a44929ecfbcd22a6264bf8fc94b4e16d0168e52d35cacd2c6185b44281ec28c9dcf863a0d78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822a00000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488da0000000000000000000000000efd0199657b444856e3259ed8e3c39ee43cf51dcb880000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003bc43ef4c08a8e600000000000000000000000000000000000000000000000000000000061437ac0000000000000000000000000000000000000000000000000000000000000000');
        const root = toBuffer('0x8a5249ef06503334c704b7606ef0f0306cb0d2474e069050a77a46c7cb52faed');

        const l2 = logs.map(t => decode(t));

        l2.forEach(t => {
            console.log(t);
        })
        console.log(encode(l2));
        // await this.bridge.deposit(11086825,
        //     root,
        //     ensureByte(encodedPath.toString('hex')),
        //     ensureByte(proofs.toString('hex')),
        //     status,
        //     gas,
        //     logsBloom,
        //     // Buffer.concat(logs, logs.reduce((total, log) => total + log.length, 0)),
        //     encode(logs.map(t => decode(t))),
        //     0);

        const argsRaw = encode(
            [
                11086825,
                root,
                ensureByte(encodedPath.toString('hex')),
                ensureByte(proofs.toString('hex')),
                status,
                gas,
                logsBloom,
                // Buffer.concat(logs, logs.reduce((total, log) => total + log.length, 0)),
                encode(logs.map(t => decode(t))),
                0
            ]
        )
        console.log("deposit args", bufferToHex(argsRaw));
        await this.bridge._deposit(
            argsRaw
        );
    });
});

// left-pad half-bytes
function ensureByte(s) {
    if (s.substr(0, 2) == '0x') { s = s.slice(2); }
    if (s.length % 2 == 0) { return `0x${s}`; }
    else { return `0x0${s}`; }
}