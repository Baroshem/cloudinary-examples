import { ClientOnly } from "remix-utils";
import { useEffect } from "react";

import { useEnv } from "../../lib/use-env";

let widget;

function UploadWidget({ children, onUpload }) {
    const ENV = useEnv()

    useEffect(() => {
        // To help improve load time of the widget on first instance, use requestIdleCallback
        // to trigger widget creation. Optional.

        requestIdleCallback(() => {
            if ( !widget ) {
                widget = createWidget();
            }
        });

        // eslint-disable-next-line
    }, []);

    /**
     * createWidget
     * @description Creates a new instance of the Cloudinary widget and stores in a ref
     */
    function createWidget() {
        // Providing only a Cloud Name along with an Upload Preset allows you to use the
        // widget without requiring an API Key or Secret. This however allows for
        // "unsigned" uploads which may allow for more usage than intended. Read more
        // about unsigned uploads at: https://cloudinary.com/documentation/upload_images#unsigned_upload
        const options = {
            cloudName: ENV.CLOUD_NAME,
            uploadPreset: ENV.CLOUDINARY_UPLOAD_PRESET, // Ex: myuploadpreset
        };

        return window.cloudinary.createUploadWidget(
            options,
            function(error, result) {
                // The callback is a bit more chatty than failed or success so
                // only trigger when one of those are the case. You can additionally
                // create a separate handler such as onEvent and trigger it on
                // ever occurance
                if (error || result.event === "success") {
                    onUpload(error, result, widget);
                }
            }
        );
    }

    /**
     * open
     * @description When triggered, uses the current widget instance to open the upload modal
     */
    function open() {
        if (!widget) {
            widget = createWidget();
        }

        widget && widget.open();
    }

    /**
     * Do not render the component if the clodinary script is not loaded
     */
    return (
        <ClientOnly fallback={<div />}>
            {() => children({
                cloudinary: window.cloudinary,
                widget,
                open,
            })}
        </ClientOnly>
    );
}

export default UploadWidget;
