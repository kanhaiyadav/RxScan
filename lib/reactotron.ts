import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";

const reactotron = Reactotron.configure({
    name: "RxScan",
})
    .useReactNative({
        asyncStorage: true,
        networking: {
            ignoreUrls: /symbolicate/, 
        },
        editor: false,
        errors: { veto: (stackFrame) => false },
        overlay: false,
    })
    .use(reactotronRedux())
    .connect();

export default reactotron;
