package app.souqalkul;

import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Capacitor plugin that shares the APK of this app via the system share sheet.
 */
@CapacitorPlugin(name = "ShareApk")
public class ShareApkPlugin extends Plugin {

    @PluginMethod()
    public void share(PluginCall call) {
        try {
            // 1. Find the installed APK path
            ApplicationInfo appInfo = getContext().getApplicationInfo();
            File sourceApk = new File(appInfo.sourceDir);

            // 2. Copy to cache so FileProvider can serve it
            File cacheDir = new File(getContext().getCacheDir(), "apk_share");
            if (!cacheDir.exists()) cacheDir.mkdirs();
            File dest = new File(cacheDir, "سوق_الكل.apk");
            copyFile(sourceApk, dest);

            // 3. Get a content:// URI via FileProvider
            String authority = getContext().getPackageName() + ".fileprovider";
            Uri contentUri = FileProvider.getUriForFile(getContext(), authority, dest);

            // 4. Build a share intent
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("application/vnd.android.package-archive");
            shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
            shareIntent.putExtra(Intent.EXTRA_TEXT,
                    "حمّل تطبيق سوق الكل - أفضل سوق إلكتروني للبيع والشراء!");
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            getActivity().startActivity(
                    Intent.createChooser(shareIntent, "مشاركة تطبيق سوق الكل"));

            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to share APK: " + e.getMessage(), e);
        }
    }

    private void copyFile(File src, File dst) throws Exception {
        try (InputStream in = new FileInputStream(src);
             OutputStream out = new FileOutputStream(dst)) {
            byte[] buf = new byte[8192];
            int len;
            while ((len = in.read(buf)) > 0) {
                out.write(buf, 0, len);
            }
        }
    }
}
