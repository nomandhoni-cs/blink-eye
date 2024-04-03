import unittest
from unittest.mock import call, patch, MagicMock
from blink_eye import BlinkEyeApp, resource_path

class TestBlinkEyeApp(unittest.TestCase):
    @patch('blink_eye.tk.PhotoImage')
    @patch('blink_eye.tk.Tk')
    def test_init(self, mock_tk, mock_photo_image):
        mock_photo_image.return_value = MagicMock()
        app = BlinkEyeApp()
        mock_tk.assert_called_once()
        self.assertEqual(app.POPUP_INTERVAL, 1200)
        self.assertEqual(app.FADE_INTERVAL, 0.1)
        self.assertEqual(app.FADE_VALUES, [i / 10 for i in range(11)])
        self.assertEqual(app.launched_time, 0)
        self.assertEqual(app.root, mock_tk.return_value)

    @patch('blink_eye.webbrowser.open')
    @patch('blink_eye.tk.PhotoImage')
    @patch('blink_eye.tk.Tk')
    def test_open_link(self, mock_tk, mock_photo_image, mock_open):
        mock_photo_image.return_value = MagicMock()
        app = BlinkEyeApp()
        app.open_link('http://example.com')
        mock_open.assert_called_once_with('http://example.com')

    @patch('blink_eye.tk.PhotoImage')
    @patch('blink_eye.tk.Tk')
    def test_skip_reminder(self, mock_tk, mock_photo_image):
        mock_photo_image.return_value = MagicMock()
        app = BlinkEyeApp()
        app.skip_reminder()
        mock_tk.return_value.withdraw.assert_called_once()

if __name__ == '__main__':
    unittest.main()