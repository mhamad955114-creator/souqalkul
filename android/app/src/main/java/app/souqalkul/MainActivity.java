package app.lovable.ddb3d223b5b54708966b845064964fb6;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShareApkPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
